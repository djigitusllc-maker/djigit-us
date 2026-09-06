const CONFIG={sheetName:'Leads',partnerSheetName:'Partners',notificationEmail:'djigitusllc@gmail.com',timezone:'America/Los_Angeles',sheetUrl:'https://docs.google.com/spreadsheets/d/1jbvRKEEGFdswpVj6rf1Xi2aMX4st65ehJ-LNw2bRm2o/edit#gid=0'};

function doPost(e){
  try{
    const data=JSON.parse(e.postData.contents||'{}');
    if(clean(data.website))throw new Error('Request rejected');
    const started=Number(data.started_at);
    const elapsed=Date.now()-started;
    if(!Number.isFinite(started)||elapsed<2500||elapsed>7200000)throw new Error('Request rejected');
    const customerName=clean(data.name);
    if(customerName.length<2)throw new Error('Enter your name');
    let digits=String(data.phone||'').replace(/\D/g,'');
    if(digits.length===11&&digits[0]==='1')digits=digits.slice(1);
    if(!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits))throw new Error('Enter a valid 10-digit US phone number');
    const phone=`(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    const contact=['WhatsApp','Call','SMS'].includes(data.contact_method)?data.contact_method:'Call';
    const ss=SpreadsheetApp.getActive();
    const leads=ss.getSheetByName(CONFIG.sheetName);
    const partners=ss.getSheetByName(CONFIG.partnerSheetName);
    if(!leads||!partners)throw new Error('Required sheets are missing');
    const code=String(data.partner_code||'').toLowerCase();
    const match=partners.getDataRange().getValues().slice(1).find(r=>String(r[0]).toLowerCase()===code&&String(r[3]).toLowerCase()!=='inactive');
    if(!match)throw new Error('Invalid partner code');
    const lock=LockService.getScriptLock();lock.waitLock(10000);
    const leadId='L-'+Utilities.formatString('%05d',Math.max(1,leads.getLastRow()));
    leads.appendRow([leadId,new Date(),'New',code,match[1],customerName,phone,contact,clean(data.vehicle),clean(data.purchase_type),clean(data.timeline),clean(data.page_url),'','','','','']);
    lock.releaseLock();
    MailApp.sendEmail({to:CONFIG.notificationEmail,subject:`New partner lead ${leadId} · ${code}`,htmlBody:`<h2>New partner lead ${leadId}</h2><p><b>Partner:</b> ${escapeHtml(match[1])} (${escapeHtml(code)})</p><p><b>Customer:</b> ${escapeHtml(customerName)}</p><p><b>Phone:</b> ${escapeHtml(phone)}</p><p><b>Preferred contact:</b> ${escapeHtml(contact)}</p><p><b>Vehicle:</b> ${escapeHtml(data.vehicle||'Not specified')}</p><p><b>Plan:</b> ${escapeHtml(data.purchase_type||'Not sure')}</p><p><b>Timeline:</b> ${escapeHtml(data.timeline||'Not specified')}</p><p><a href="${CONFIG.sheetUrl}">Open DJIGIT Partner Leads</a></p>`});
    return json({ok:true,lead_id:leadId});
  }catch(err){return json({ok:false,error:String(err.message||err)});}
}

function setupWorkbook(){const ss=SpreadsheetApp.getActive();let leads=ss.getSheetByName(CONFIG.sheetName)||ss.insertSheet(CONFIG.sheetName);let partners=ss.getSheetByName(CONFIG.partnerSheetName)||ss.insertSheet(CONFIG.partnerSheetName);if(leads.getLastRow()===0)leads.appendRow(['Lead ID','Created','Status','Partner Code','Partner Name','Customer Name','Phone','Preferred Contact','Vehicle','Purchase Type','Timeline','Page URL','Owner','Next Follow-up','Outcome','15m Reminder Sent','30m Reminder Sent']);if(partners.getLastRow()===0){partners.appendRow(['Partner Code','Partner Name','Type','Status','Public URL','QR File','Notes']);for(let i=1;i<=10;i++){const code='p'+String(i).padStart(3,'0');partners.appendRow([code,'Partner '+String(i).padStart(3,'0'),'Auto Service','Active','https://djigit.us/partner/'+code+'/','qr-'+code+'.png','Replace name when assigned']);}}leads.setFrozenRows(1);partners.setFrozenRows(1);leads.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['New','Contacted','No response','Qualified','Application','Vehicle search','Deal','Closed'],true).build());}
function sendPendingLeadReminder(){const sheet=SpreadsheetApp.getActive().getSheetByName(CONFIG.sheetName);if(!sheet||sheet.getLastRow()<2)return;const rows=sheet.getRange(2,1,sheet.getLastRow()-1,17).getValues();const now=Date.now();rows.forEach((r,i)=>{if(r[2]!=='New'||!(r[1] instanceof Date))return;const age=now-r[1].getTime();let stage=0,col=0;if(age>=30*60*1000&&r[15]&&!r[16]){stage=2;col=17;}else if(age>=15*60*1000&&!r[15]){stage=1;col=16;}if(!stage)return;MailApp.sendEmail({to:CONFIG.notificationEmail,subject:`Reminder ${stage}/2 · ${r[0]} still New`,htmlBody:`<h2>Partner lead ${r[0]} is still New</h2><p><b>Reminder:</b> ${stage===1?'15 minutes':'30 minutes'}</p><p><b>Partner:</b> ${escapeHtml(r[4])} (${escapeHtml(r[3])})</p><p><b>Customer:</b> ${escapeHtml(r[5])}</p><p><b>Phone:</b> ${escapeHtml(r[6])}</p><p><a href="${CONFIG.sheetUrl}">Open DJIGIT Partner Leads</a></p>`});sheet.getRange(i+2,col).setValue(new Date());});}
function installReminderTrigger(){ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='sendPendingLeadReminder').forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger('sendPendingLeadReminder').timeBased().everyMinutes(15).create();}
function clean(v){return String(v||'').trim().slice(0,500);}
function escapeHtml(v){return clean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function json(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
