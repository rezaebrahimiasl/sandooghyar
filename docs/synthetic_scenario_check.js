// Reproduces the [EXEC] examples of 04_FINANCIAL_RULES_AND_CALCULATIONS.md. Serve the public repo folder on :8791, then: node synthetic_scenario_check.js (needs Playwright + Chromium).
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8791/index.html');await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const out={};
 // synthetic: fund F1 with two members
 S.persons.push({id:'P9001',name:'عضو الف'},{id:'P9002',name:'عضو ب'});
 S.mems.push({id:'M9001',pid:'P9001',fid:'F1',status:'فعال',os:10,ol:0},{id:'M9002',pid:'P9002',fid:'F1',status:'فعال',os:5,ol:8});
 const T=(id,type,amt,mid,i,x)=>S.tx.push(Object.assign({id,type,amt,fid:'F1',mid,per:pk('F1',i),at:'2026-01-01T00:00:0'+i+'Z'},x||{}));
 T('T9001','sav',1,'M9001',0);T('T9002','inst',2,'M9002',0);T('T9003','loan',5,'M9001',0,{term:10});S.loans.push({id:'L9001',fid:'F1',mid:'M9001',amt:5,per:pk('F1',0),kind:'جدید',term:10});
 out.osol=osol('F1');out.balA0=bal('M9001',0);out.balB0=bal('M9002',0);out.cash0=cashOf('F1',0);out.ybs0=(v=>({cash:v.cash,loan:v.loan,sav:v.sav,as:v.as,li:v.li,eq:v.eq,open:v.open}))(ybs('F1',0));
 out.sugg_A1=sugg('M9001',1);out.room_B1=loanRoom('M9002',1);
 // overpayment month1: B owes 6, pays 7 via addTx logic emulation (inst capped -> credit)
 T('T9004','inst',6,'M9002',1);T('T9005','credit',1,'M9002',1,{note:'مازاد قسط'});out.balB1=bal('M9002',1);
 // correction inst->sav 1 for B in month1
 T('T9006','rcl',1,'M9002',1,{from:'inst',to:'sav'});out.balB1rcl=bal('M9002',1);
 // fund ops month1: income 1.5, gift 0.7, cap 10 refundable from external, capret 4
 S.ops.push({id:'O9001',type:'inc',fid:'F1',per:pk('F1',1),amt:1.5,at:'x'},{id:'O9002',type:'gift',fid:'F1',per:pk('F1',1),amt:0.7,at:'x'},{id:'O9003',type:'cap',fid:'F1',per:pk('F1',1),amt:10,src:'سرمایه‌گذار نمونه',rp:1,at:'x'},{id:'O9004',type:'capret',fid:'F1',per:pk('F1',1),amt:4,src:'سرمایه‌گذار نمونه',at:'x'});
 out.cash1=cashOf('F1',1);out.fsum1=(o=>({s:o.s,l:o.l,c:o.c,j:o.j,d:o.d,co:o.co}))(fsum('F1',1));out.ybs1=(v=>({cash:v.cash,loan:v.loan,sav:v.sav,cr:v.cr,cap:v.cap,res:v.res,open:v.open,as:v.as,li:v.li,eq:v.eq}))(ybs('F1',1));
 out.capBal=capBal('F1',1);
 // opening cash recorded 3 (real)
 S.ops.push({id:'O9005',type:'jv',jk:'oc',fid:'F1',per:pk('F1',0),amt:3,ln:[['cash',3,0],['open',0,3]],at:'x'});
 out.cash1_oc=cashOf('F1',1);out.ybs1_oc=(v=>({cash:v.cash,open:v.open,as:v.as,li:v.li,eq:v.eq}))(ybs('F1',1));
 // inter-fund transfer of savings 2 from A (F1) to a F2 member
 S.persons.push({id:'P9003',name:'عضو ج'});S.mems.push({id:'M9003',pid:'P9003',fid:'F2',status:'فعال',os:0,ol:0});
 S.tx.push({id:'T9007',type:'xout',amt:2,fid:'F1',mid:'M9001',per:pk('F1',1),cp:'M9003',bk:'sav',xid:'X9001'},{id:'T9008',type:'xin',amt:2,fid:'F2',mid:'M9003',per:pk('F2',1),cp:'M9001',bk:'sav',xid:'X9001'});
 out.after_x={A:bal('M9001',1).s,C:bal('M9003',1).s,cashF1:cashOf('F1',1),icF1:icOf('F1',1),cashF2:cashOf('F2',1),icF2:icOf('F2',1),bsF1:(v=>({icA:v.icA,icL:v.icL,cash:v.cash}))(ybs('F1',1))};
 out.Fs=[Fs(1.25),Fs(-1.25),Fs(-0.04),Fs(2.35)];out.F=[F(0.1234567),F(12.5)];out.Rl=Rl(2.5);out.R=R(0.1+0.2);
 out.pk=[pk('F1',0),pk('F1',14)];out.pix=pix('F1-1406-03');
 out.vdate=[vdate('1405/3/5'),vdate('1405/13/01'),vdate('1405/12/31')];
 out.health=health().filter(x=>x.l=='E').map(x=>x.c);
 return out});
console.log(JSON.stringify(r,null,1));console.log('errors',errs);await b.close()})();
