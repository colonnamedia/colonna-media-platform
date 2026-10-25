/* Colonna Media: navigation, service selection, and project inquiries. */
(function(){
const header=document.querySelector('header');
if(header){const sync=()=>header.classList.toggle('scrolled',window.scrollY>30);window.addEventListener('scroll',sync,{passive:true});sync();}
const toggle=document.querySelector('.menu-toggle'),menu=document.getElementById('mobileMenu');
if(toggle&&menu){toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');}});}
const reveal=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.08});reveal.forEach(el=>io.observe(el));}else reveal.forEach(el=>el.classList.add('in'));
const form=document.getElementById('cform');if(!form)return;
const requested=new URLSearchParams(window.location.search).getAll('service').flatMap(s=>s.split(','));
form.querySelectorAll('input[name="services"]').forEach(box=>{box.checked=requested.includes(box.value);});
form.addEventListener('submit',async e=>{
e.preventDefault();if(!form.reportValidity())return;
const button=form.querySelector('button[type="submit"]'),status=document.getElementById('form-status'),original=button.textContent;
const value=id=>document.getElementById(id)?.value.trim()||'';
const services=Array.from(form.querySelectorAll('input[name="services"]:checked'),box=>box.value);
button.disabled=true;button.textContent='Sending…';status.className='form-status';status.textContent='';
try{
 const response=await fetch('/api/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:value('cf-name'),email:value('cf-email'),business_name:value('cf-business'),phone:value('cf-phone'),location:value('cf-location'),website_url:value('cf-site'),timing:value('cf-timing'),services,message:value('cf-msg'),website:value('cf-website')})});
 const result=await response.json().catch(()=>({}));if(!response.ok||!result.success)throw Error('Submission failed');
 status.className='form-status success';status.textContent='Thanks—your inquiry was sent to Anthony. He will follow up with you directly.';form.reset();button.textContent='Inquiry sent ✓';
 if(typeof window.gtag==='function')window.gtag('event','generate_lead',{form_id:'service_inquiry',service_count:services.length});
}catch(error){status.className='form-status error';status.innerHTML='Your inquiry could not be sent. Please try again or email <a href="mailto:colonnamedia@gmail.com">colonnamedia@gmail.com</a>.';button.textContent=original;button.disabled=false;}
});
})();