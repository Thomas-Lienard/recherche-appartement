import { google } from "googleapis";

function getOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
) {
  const oauth2Client = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
  ];
  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });

  return res.data;
}

export async function createCalendarEvent(
  accessToken: string,
  params: {
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string; // ISO 8601
    durationMinutes?: number;
    reminderMinutes?: number;
  }
) {
  const oauth2Client = getOAuth2Client(accessToken);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const start = new Date(params.startDateTime);
  const end = new Date(
    start.getTime() + (params.durationMinutes || 60) * 60000
  );

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: params.summary,
      description: params.description,
      location: params.location,
      start: {
        dateTime: start.toISOString(),
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Europe/Paris",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: params.reminderMinutes ?? 30 },
          { method: "email", minutes: params.reminderMinutes ?? 30 },
        ],
      },
    },
  });

  return res.data;
}
