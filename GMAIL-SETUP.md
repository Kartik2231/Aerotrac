# AEROTRAC Gmail contact delivery

The `/contact` page is public. Any visitor can submit an enquiry; the backend saves it to `server-data/aerotrac.json` and sends a notification to the configured AEROTRAC owner mailbox.

1. Enable 2-Step Verification on the Gmail account that will send AEROTRAC mail.
2. Create a Google App Password for that account.
3. Copy `.env.example` to `.env`.
4. Set:
   - `GMAIL_USER` = the Gmail account used only for sending AEROTRAC notifications
   - `GMAIL_APP_PASSWORD` = the 16-character Google App Password
   - `CONTACT_TO` = the Gmail inbox where you want every website enquiry delivered
5. Restart the server with `npm run dev`.

The visitor's email is used as `Reply-To`, so pressing Reply answers the visitor. The backend does not spoof the visitor's address as the Gmail sender.

Do not put the App Password in frontend code or commit `.env`.
