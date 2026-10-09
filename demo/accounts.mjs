import {decisionRecord,tabAuthStorage} from './decision-record.mjs';

const escape=value=>String(value??'').normalize('NFC').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(value);
const percent=value=>`${(value*100).toFixed(2)}%`;

export function accounts(getResult,onSignOut) {
  const callbackParams=new URLSearchParams(location.search);
  const callbackCode=callbackParams.get('code'),callbackError=callbackParams.get('error');
  if(callbackCode || callbackError) window.history.replaceState(null,'',location.pathname);
  let client=null, user=null, generation=0, busy=false;
  const status=document.querySelector('#account-status'),login=document.querySelector('#account-login'),logout=document.querySelector('#account-logout');
  const history=document.querySelector('#decision-history'),historyStatus=document.querySelector('#decision-history-status'),refresh=document.querySelector('#refresh-decisions');
  const feedback=document.querySelector('#decision-feedback'),form=document.querySelector('#decision-form'),save=form.querySelector('button[type=submit]');
  const note=document.querySelector('#decision-account-note');

  function state(next) {
    const changed=user?.id!==next?.id;
    user=next;if(changed)generation++;
    if(changed){history.replaceChildren();historyStatus.textContent=user?'Đang tải quyết định…':'Đăng nhập để xem lịch sử.';feedback.textContent='';}
    logout.hidden=!user;login.hidden=!!user;refresh.disabled=!user;
    status.textContent=user?'Đã đăng nhập. Nhật ký chỉ hiển thị cho tài khoản hiện tại.':'Đăng nhập Google để lưu và xem nhật ký riêng.';
    note.textContent=user?'Quyết định được lưu vào tài khoản hiện tại, kèm bản tóm tắt kết quả.':'Cần đăng nhập để lưu lâu dài. Bạn vẫn có thể phân tích mà không đăng nhập.';
    save.textContent=user?'Lưu quyết định vào tài khoản':'Đăng nhập để lưu quyết định';
    save.disabled=!client || busy;
  }
  async function loadHistory() {
    if(!user || !client)return;
    const epoch=generation;
    historyStatus.textContent='Đang tải quyết định…';refresh.disabled=true;
    try {
      const {data,error}=await client.from('decisions').select('id,decision,reason,snapshot,created_at').order('created_at',{ascending:false}).limit(100);
      if(epoch!==generation)return;
      if(error)throw error;
      history.innerHTML=data.map(row=>{
        const s=row.snapshot;
        if(s?.schemaVersion!==1 || !Array.isArray(s.holdings))return `<article class="saved-decision"><h4>${escape(row.decision)}</h4><p class="decision-reason-text">${escape(row.reason)}</p><p>Bản tóm tắt này không tương thích với phiên bản hiện tại.</p><button type="button" class="text-button" data-delete-decision="${escape(row.id)}">Xóa quyết định</button></article>`;
        return `<article class="saved-decision"><div class="panel-heading"><h4>${escape(row.decision)}</h4><time>${escape(new Date(row.created_at).toLocaleString('vi-VN'))}</time></div><p class="decision-reason-text">${escape(row.reason)}</p><p>${escape(s.startDate)} → ${escape(s.endDate)} · Vốn ${escape(money(s.initialCapital))} · Return ${escape(percent(s.periodReturn))} · Volatility ${escape(percent(s.volatility))}</p><p class="table-footnote">${escape(s.holdings.map(h=>`${h.symbol}: ${percent(h.weight)}`).join(' · '))}</p><button type="button" class="text-button" data-delete-decision="${escape(row.id)}">Xóa quyết định</button></article>`;
      }).join('');
      historyStatus.textContent=data.length?`Đang hiển thị ${data.length} quyết định gần nhất. Đây là kết quả tại thời điểm lưu, không phải báo giá mới.`:'Chưa có quyết định. Hãy phân tích danh mục, chọn quyết định và lưu tại trang Phân tích.';
    } catch {if(epoch===generation)historyStatus.textContent='Không tải được lịch sử. Kiểm tra kết nối rồi bấm Tải lại; dữ liệu chưa bị xóa.';}
    finally {if(epoch===generation)refresh.disabled=!user;}
  }
  login.addEventListener('click',async()=>{
    if(!client)return;
    login.disabled=true;status.textContent='Đang chuyển sang Google…';
    const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${location.origin}/account`,queryParams:{prompt:'select_account'}}});
    if(error){status.textContent='Chưa thể đăng nhập Google. Hãy kiểm tra cấu hình Google provider và redirect URL.';login.disabled=false;}
  });
  logout.addEventListener('click',async()=>{
    logout.disabled=true;
    try {
      const {error}=await client.auth.signOut({scope:'local'});
      if(error)throw error;
      state(null);onSignOut();
      form.reset();status.textContent='Đã đăng xuất và xóa dữ liệu Finfolio trên trình duyệt này. Nhật ký trên tài khoản không bị xóa.';
    } catch {status.textContent='Đăng xuất chưa thành công. Kiểm tra kết nối và thử lại.';}
    finally {logout.disabled=false;}
  });
  refresh.addEventListener('click',loadHistory);
  history.addEventListener('click',async event=>{
    const button=event.target.closest('[data-delete-decision]');
    if(!button || !user || !confirm('Xóa quyết định này khỏi tài khoản? Thao tác không thể hoàn tác.'))return;
    const epoch=generation;button.disabled=true;
    const {data,error}=await client.from('decisions').delete().eq('id',button.dataset.deleteDecision).select('id');
    if(epoch!==generation)return;
    if(error || !data?.length){historyStatus.textContent='Chưa xóa được quyết định. Vui lòng tải lại và thử lại.';button.disabled=false;}else await loadHistory();
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    if(!client || !user){feedback.textContent='Hãy mở Tài khoản & quyết định và đăng nhập Google trước khi lưu.';return;}
    busy=true;save.disabled=true;const epoch=generation;
    try {
      const {data:verified,error:authError}=await client.auth.getUser();
      if(authError || !verified.user || verified.user.id!==user.id)throw new Error('Phiên đăng nhập không hợp lệ. Hãy đăng nhập lại.');
      const row=decisionRecord(getResult(),new FormData(form).get('decision'),document.querySelector('#decision-reason').value,verified.user.id,crypto.randomUUID());
      feedback.textContent='Đang lưu vào tài khoản…';
      const {data,error}=await client.from('decisions').insert(row).select('id').single();
      if(epoch!==generation)return;
      if(error || !data?.id)throw new Error('Không xác nhận được việc lưu. Kiểm tra nhật ký trước khi thử lại để tránh lưu trùng.');
      feedback.textContent='Đã lưu quyết định vào tài khoản. Mở Tài khoản & quyết định để xem lại.';
      feedback.scrollIntoView({block:'nearest',behavior:'smooth'});await loadHistory();
    } catch(error){if(epoch===generation)feedback.textContent=error.message || 'Chưa lưu được quyết định.';}
    finally {busy=false;save.disabled=!client;}
  });

  return {async start(){
    save.disabled=true;
    try {
      const response=await fetch('/api/account-config',{cache:'no-store'});
      if(!response.ok)throw new Error();const config=await response.json();
      if(!config.configured)throw new Error();
      const {createClient}=await import('./vendor/supabase.mjs');
      client=createClient(config.url,config.publishableKey,{auth:{flowType:'pkce',storage:tabAuthStorage(sessionStorage),storageKey:'finfolio-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
      if(callbackCode){const {error}=await client.auth.exchangeCodeForSession(callbackCode);if(error)throw new Error('Đăng nhập không hoàn tất; hãy thử lại trong cùng tab.');}
      client.auth.onAuthStateChange((_event,session)=>{queueMicrotask(()=>{state(session?.user??null);if(user)void loadHistory();});});
      const {data,error}=await client.auth.getSession();if(error)throw error;
      state(data.session?.user??null);login.disabled=false;if(user)await loadHistory();
      if(callbackError)status.textContent='Đăng nhập đã bị hủy hoặc Google từ chối. Bạn có thể thử lại.';
      const settings=await fetch(`${config.url}/auth/v1/settings`,{headers:{apikey:config.publishableKey}}).then(r=>r.json());
      if(!settings.external?.google && !user){login.disabled=true;status.textContent='Google provider chưa được cấu hình. Phân tích vẫn hoạt động; chưa thể đăng nhập và lưu quyết định.';}
    } catch(error){
      status.textContent=error.message || 'Chức năng tài khoản chưa được cấu hình trên host này. Bạn vẫn có thể phân tích danh mục.';
      note.textContent='Chức năng lưu theo tài khoản hiện chưa sẵn sàng trên host này.';save.disabled=true;
    }
  }};
}
