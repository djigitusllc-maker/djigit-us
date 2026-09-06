# DJIGIT partner lead system

## Assignment workflow

1. Choose the next unused code in the Partners sheet, starting with `p001`.
2. Replace `Partner 001` with the business name and add its type, contact, and notes.
3. Update the same name in `/partner/partners.js` before publishing. The public URL and printed QR never change.
4. Give the partner the matching poster and QR file.
5. Test the QR and submit one test lead. Mark that row `Closed` after verification.

## Lead flow

`QR scan → /partner/p001/ → English form → Apps Script → Leads sheet → email notification → follow-up → status update`

The partner code is hidden in the form and validated against the Partners sheet. WhatsApp contains the same code in the prepared message, but a WhatsApp click alone does not create a CRM row.

## Google setup

1. Create a blank Google Sheet named `DJIGIT Partner Leads`.
2. Open Extensions → Apps Script and paste `Code.gs`.
3. Run `setupWorkbook()` once and approve access. It creates Leads and Partners tabs.
4. Change `notificationEmail` in CONFIG if necessary.
5. Deploy → New deployment → Web app. Execute as Me. Access: Anyone.
6. Copy the `/exec` URL into the website before publishing as `window.DJIGIT_LEAD_ENDPOINT`.
7. Add a time-driven trigger for `sendPendingLeadReminder`, every 15 minutes.
8. Submit one test lead from each assigned QR code.

## Operating routine

- New email: open the Leads sheet and contact the customer.
- Change `New` to `Contacted` immediately.
- Use `Qualified` only after vehicle, budget direction, and timing are understood.
- Use `Application` only when the customer has been sent the credit application.
- Complete Owner, Next Follow-up, and Outcome; never store SSN or financial documents here.
- Weekly: filter by Partner Code and compare leads, qualified leads, applications, and deals.

## Recommended printed format

Use one letter/A4 counter sign per partner in a clear acrylic tabletop holder. Print at 100% scale on matte 200–250 gsm stock. Place the QR between chest and eye level, with at least 1 inch of empty space around it. Keep a small test code in the bottom corner for staff identification.
