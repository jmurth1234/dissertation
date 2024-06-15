const fs = require("fs");
const { promisify } = require("util");
const { google } = require("googleapis");
const filetype = require("file-type");

const credentials = require("../../../config/google-credentials.json");
const config = require("../../../config/server.json");

const TOKEN_PATH = "./config/token.json";

const scope = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive",
];

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const authorize = async () => {
  try {
    const content = await readFileAsync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(content));
  } catch (e) {
    console.error("Failed to auth", e);
    return false;
  }

  return true;
};

const beginLogin = () => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope,
  });

  return authUrl;
};

const completeLogin = async (code) => {
  let res;
  try {
    res = await oAuth2Client.getToken(code);
  } catch (e) {
    console.error("Error retrieving access token", e);
    return false;
  }

  oAuth2Client.setCredentials(res.tokens);

  try {
    await writeFileAsync(TOKEN_PATH, JSON.stringify(res.tokens));
    console.log("Token stored to", TOKEN_PATH);
  } catch (e) {
    console.error("Error saving access token", e);

    return false;
  }

  return true;
};

function createEmail(to, from, subject, content) {
  var str = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    `to: ${to}\n`,
    `from: ${from}\n`,
    `subject: ${subject}\n\n`,
    content,
  ].join("");

  var encodedMail = new Buffer(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return encodedMail;
}

const sendEmail = async (subject, content) => {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const profile = await gmail.users.getProfile({
    userId: "me",
  });

  const raw = createEmail(
    config.email,
    profile.data.emailAddress,
    subject,
    content
  );

  console.log(raw);

  return await gmail.users.messages.send({
    userId: "me",
    resource: {
      raw,
    },
  });
};

const uploadFile = async (filename, path) => {
  const type = await filetype.fromFile(path);
  const drive = google.drive({ version: "v3", auth: oAuth2Client });

  const folders = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name='Captured Video'",
    fields: 'nextPageToken, files(id, name)',
    spaces: 'drive'
  })

  let folder = folders.data.files[0]

  console.log(folder)

  if (!folder) {
    const fileMetadata = {
      'name': 'Captured Video',
      'mimeType': 'application/vnd.google-apps.folder'
    };
    folder = (await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    })).data
  }

  var fileMetadata = {
    name: filename,
    parents: [folder.id]
  };

  var media = {
    mimeType: type.mime,
    body: fs.createReadStream(path),
  };

  return await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id,webViewLink",
  });
};

module.exports = {
  authorize,
  beginLogin,
  completeLogin,
  sendEmail,
  uploadFile,
};
