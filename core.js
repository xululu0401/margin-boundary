(function(root){'use strict';
const defaults={price:39,cost:18,fee:2,fixed:30000,days:26,capacity:100,orders:60,target:5000};
const fields={price:['单价',100000,2,0],cost:['单笔变动成本',100000,2,0],fee:['比例扣点',99,2,0],fixed:['月固定开支',100000000,2,0],days:['营业天数',31,0,1],capacity:['日接单上限',100000,0,0],orders:['预估日单量',100000,0,0],target:['月目标利润',100000000,2,0]};
function validate(raw){const s={};for(const [k,[name,max,dp,min]] of Object.entries(fields)){let v=raw?.[k];if(v===null||v===undefined||typeof v==='boolean'||(typeof v!=='number'&&typeof v!=='string')||String(v).trim()==='')throw Error(name+'不能为空');let n=Number(v);if(!Number.isFinite(n)||n<min||n>max||Math.abs(n*10**dp-Math.round(n*10**dp))>1e-6)throw Error(name+'须为'+min+'–'+max+'内'+(dp?'最多2位小数':'整数'));s[k]=n;}if(s.orders>s.capacity)throw Error('预估日单量不能超过日接单上限');return s;}
const cents=n=>BigInt(Math.round(n*100)); const ceil=(a,b)=>(a+b-1n)/b;const money=n=>Number(n)/1e6;
function calc(raw){let s=validate(raw), r=BigInt(Math.round(s.fee*100)), m=cents(s.price)*(10000n-r)-cents(s.cost)*10000n,F=cents(s.fixed)*10000n,T=cents(s.target)*10000n,Q=s.orders*s.days,C=s.capacity*s.days;
const profit=q=>money(m*BigInt(q)-F);const threshold=n=>n===0n?0:m>0n?Number(ceil(n,m)):null;
let be=threshold(F),goal=threshold(F+T),pFloor=Q>0?Number(ceil(cents(s.cost)*10000n*BigInt(Q)+F+T,(10000n-r)*BigInt(Q)))/100:null;
return {input:s,margin:money(m),monthlyOrders:Q,monthlyCapacity:C,revenue:s.price*Q,variableCost:s.cost*Q,feeCost:s.price*Q*s.fee/100,profit:profit(Q),capacityProfit:profit(C),bestProfit:Math.max(profit(0),profit(C)),breakEven:be,goalOrders:goal,goalDaily:goal===null?null:Math.ceil(goal/s.days),feasible:goal!==null&&goal<=C,priceFloor:pFloor,safetyOrders:be===null?null:Q-be,points:[{q:0,profit:profit(0)},{q:Q,profit:profit(Q)},{q:C,profit:profit(C)}]};}
function scenarios(raw){const s=validate(raw);return [-.1,0,.1].flatMap(p=>[-.2,0,.2].map(q=>{let v={...s,price:Math.min(100000,Math.round(s.price*(1+p)*100)/100),orders:Math.min(s.capacity,Math.round(s.orders*(1+q)))};return {p,q,result:calc(v)};}));}
const api={defaults,fields,validate,calc,scenarios};if(typeof module!=='undefined')module.exports=api;root.AppCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
