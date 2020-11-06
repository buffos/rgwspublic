const https = require('https');

const hostname = 'www1.gsis.gr';
const path = '/webtax2/wsgsis/RgWsPublic/RgWsPublicPort';

const errorCodes = {
  RG_WS_PUBLIC_AFM_CALLED_BY_BLOCKED:
    'Ο χρήστης που καλεί την υπηρεσία έχει προσωρινά αποκλειστεί από τη χρήση της.',
  RG_WS_PUBLIC_AFM_CALLED_BY_NOT_FOUND:
    'Ο Α.Φ.Μ. για τον οποίο γίνεται η κλήση δε βρέθηκε στους έγκυρους Α.Φ.Μ. του Μητρώου TAXIS.',
  RG_WS_PUBLIC_EPIT_NF:
    'O Α.Φ.Μ. για τον οποίο ζητούνται πληροφορίες δεν ανήκει και δεν ανήκε ποτέ σε νομικό πρόσωπο, νομική οντότητα, ή φυσικό πρόσωπο με εισόδημα από επιχειρηματική δραστηριότητα.',
  RG_WS_PUBLIC_FAILURES_TOLERATED_EXCEEDED:
    'Υπέρβαση μέγιστου επιτρεπτού ορίου πρόσφατων αποτυχημένων κλήσεων. Προσπαθήστε εκ νέου σε μερικές ώρες.',
  RG_WS_PUBLIC_MAX_DAILY_USERNAME_CALLS_EXCEEDED:
    'Υπέρβαση μέγιστου επιτρεπτού ορίου ημερήσιων κλήσεων ανά χρήστη (ανεξαρτήτως εξουσιοδοτήσεων).',
  RG_WS_PUBLIC_MONTHLY_LIMIT_EXCEEDED:
    'Υπέρβαση του Μέγιστου Επιτρεπτού Μηνιαίου Ορίου Κλήσεων.',
  RG_WS_PUBLIC_MSG_TO_TAXISNET_ERROR:
    'Δημιουργήθηκε πρόβλημα κατά την ενημέρωση των εισερχόμενων μηνυμάτων στο MyTAXISnet.',
  RG_WS_PUBLIC_NO_INPUT_PARAMETERS:
    'Δε δόθηκαν υποχρεωτικές παράμετροι εισόδου για την κλήση της υπηρεσίας.',
  RG_WS_PUBLIC_SERVICE_NOT_ACTIVE: 'Η υπηρεσία δεν είναι ενεργή.',
  RG_WS_PUBLIC_TAXPAYER_NF:
    'O Α.Φ.Μ. για τον οποίο ζητούνται πληροφορίες δε βρέθηκε στους έγκυρους Α.Φ.Μ. του Μητρώου TAXIS.',
  RG_WS_PUBLIC_TOKEN_AFM_BLOCKED:
    'Ο χρήστης (ή ο εξουσιοδοτημένος τρίτος) που καλεί την υπηρεσία έχει προσωρινά αποκλειστεί από τη χρήση της.',
  RG_WS_PUBLIC_TOKEN_AFM_NOT_AUTHORIZED:
    'Ο τρέχον χρήστης δεν έχει εξουσιοδοτηθεί από τον Α.Φ.Μ. για χρήση της υπηρεσίας.',
  RG_WS_PUBLIC_TOKEN_AFM_NOT_FOUND:
    'Ο Α.Φ.Μ. του τρέχοντος χρήστη δε βρέθηκε στους έγκυρους Α.Φ.Μ. του Μητρώου TAXIS.',
  RG_WS_PUBLIC_TOKEN_AFM_NOT_REGISTERED:
    'Ο τρέχον χρήστης δεν έχει εγγραφεί για χρήση της υπηρεσίας.',
  RG_WS_PUBLIC_TOKEN_USERNAME_NOT_ACTIVE:
    'Ο κωδικός χρήστη (username) που χρησιμοποιήθηκε έχει ανακληθεί.',
  RG_WS_PUBLIC_TOKEN_USERNAME_NOT_AUTHENTICATED:
    'Ο συνδυασμός χρήστη/κωδικού πρόσβασης που δόθηκε δεν είναι έγκυρος.',
  RG_WS_PUBLIC_TOKEN_USERNAME_NOT_DEFINED:
    'Δεν ορίσθηκε ο χρήστης που καλεί την υπηρεσία.',
  RG_WS_PUBLIC_TOKEN_USERNAME_TOO_LONG:
    'Διαπιστώθηκε υπέρβαση του μήκους του ονόματος του χρήστη (username) της υπηρεσίας',
  RG_WS_PUBLIC_WRONG_AFM:
    'O Α.Φ.Μ. για τον οποίο ζητούνται πληροφορίες δεν είναι έγκυρος.',
};

/**
 * Extract from an xml string the contents of a tag
 * @param {string} xml
 * @param {string tag
 * @returns {String}
 */
const tagContent = (xml, tag) => {
  const start = xml.indexOf(`<${tag}>`) + tag.length + 2; // +2 is for opening and closing brackets
  const end = xml.indexOf(`</${tag}>`);
  return xml.substring(start, end === -1 ? xml.length : end);
};
/**
 * Make an HTTPS XML request with a specified body
 * @param hostname
 * @param path
 * @param body
 * @returns {Promise<String>}
 */
const makeXMLRequest = (hostname, path, body) => {
  const options = {
    hostname: hostname,
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      Connection: 'Close',
      'Content-Length': body.length,
    },
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let output = '';
      if (response.statusCode !== 200)
        reject('Η υπηρεσία δεν λειτουργεί αυτή την στιγμή');
      response.on('data', (d) => (output += d));
      response.on('end', () => resolve(output.toString()));
    });
    request.on('error', (error) => {
      reject(error);
    });
    request.write(body);
    request.end();
  });
};
/**
 * Parses the xml data returned from AADE and returns an object with AFM data or null
 * @param xml
 * @returns {{afmData: null, error: string}|{afmData: {}, error: null}}
 */
const parseXMLAFMData = (xml) => {
  const regex = /<m:([A-z]+)>([A-zΑ-ώ0-9 ]+)<\/m:([A-z]+)>/gm;
  const matches = xml.matchAll(regex);
  const afmData = {};
  for (const match of matches) {
    afmData[match[1]] = match[2].trim();
  }
  if (afmData['errorCode'])
    return { afmData: null, error: errorCodes[afmData['errorCode']] };
  return { afmData, error: null };
};
/**
 * Checks if a greek VAT number is valid or not
 * @param vat
 * @returns {boolean}
 */
const isValid = (vat) => {
  if (!vat.match(/^\d{9}$/) || vat === '000000000') return false;

  let m = 1,
    sum = 0;
  for (let i = 7; i >= 0; i--) {
    m *= 2;
    sum += vat.charAt(i) * m;
  }

  return (sum % 11) % 10 === Number(vat.charAt(8));
};
/**
 * Checks the AADE server and responds with a string
 * @returns {Promise<String>}
 */
const version = async () => {
  const env = `<?xml version="1.0" encoding="UTF-8"?>
			<env:Envelope
			xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"
			xmlns:ns="http://gr/gsis/rgwspublic/RgWsPublic.wsdl"
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
			xmlns:xsd="http://www.w3.org/2001/XMLSchema">
			<env:Header/>
			<env:Body>
			<ns:rgWsPublicVersionInfo/>
			</env:Body>
			</env:Envelope>`;

  const response = await makeXMLRequest(hostname, path, env).catch((e) =>
    console.error(e)
  );
  if (!response) return 'Η υπηρεσία δεν λειτουργεί αυτή την στιγμή';
  return tagContent(response, 'result');
};
/**
 *
 * @param {string} calledBy
 * @param {string} calledFor
 * @param {string} user
 * @param {string} pass
 * @returns {{afmData: null, error: string}|{afmData: {}, error: null}}
 */
const afmInfo = async (calledBy, calledFor, user, pass) => {
  const afmData = {};
  if (calledBy !== '' && !isValid(calledBy))
    return { afmData: null, error: 'To ΑΦΜ του καλούντα δεν είναι έγκυρο' };
  if (!isValid(calledFor))
    return { afmData: null, error: 'To ΑΦΜ της αναζήτησης δεν είναι έγκυρο' };
  if (user.length < 6 || pass.length < 6)
    return {
      afmData: null,
      error: 'To username ή το password δεν είναι έγκυρα',
    };

  const env = `<?xml version="1.0" encoding="UTF-8"?>
		<env:Envelope
		xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"
		xmlns:ns="http://gr/gsis/rgwspublic/RgWsPublic.wsdl"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xmlns:xsd="http://www.w3.org/2001/XMLSchema"
		xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-
		1.0.xsd">
		<env:Header>
		<ns1:Security>
		<ns1:UsernameToken>
		<ns1:Username>${user}</ns1:Username>
		<ns1:Password>${pass}</ns1:Password>
		</ns1:UsernameToken>
		</ns1:Security>
		</env:Header>
		<env:Body>
		<ns:rgWsPublicAfmMethod>
		<RgWsPublicInputRt_in xsi:type="ns:RgWsPublicInputRtUser">
		<ns:afmCalledBy>${calledBy}</ns:afmCalledBy>
		<ns:afmCalledFor>${calledFor}</ns:afmCalledFor>
		</RgWsPublicInputRt_in>
		<RgWsPublicBasicRt_out xsi:type="ns:RgWsPublicBasicRtUser">
		<ns:afm xsi:nil="true"/>
		<ns:stopDate xsi:nil="true"/>
		<ns:postalAddressNo xsi:nil="true"/>
		<ns:doyDescr xsi:nil="true"/>
		<ns:doy xsi:nil="true"/>
		<ns:onomasia xsi:nil="true"/>
		<ns:legalStatusDescr xsi:nil="true"/>
		<ns:registDate xsi:nil="true"/>
		<ns:deactivationFlag xsi:nil="true"/>
		<ns:deactivationFlagDescr xsi:nil="true"/>
		<ns:postalAddress xsi:nil="true"/>
		<ns:firmFlagDescr xsi:nil="true"/>
		<ns:commerTitle xsi:nil="true"/>
		<ns:postalAreaDescription xsi:nil="true"/>
		<ns:INiFlagDescr xsi:nil="true"/>
		<ns:postalZipCode xsi:nil="true"/>
		</RgWsPublicBasicRt_out>
		<arrayOfRgWsPublicFirmActRt_out xsi:type="ns:RgWsPublicFirmActRtUserArray"/>
		<pCallSeqId_out xsi:type="xsd:decimal">0</pCallSeqId_out>
		<pErrorRec_out xsi:type="ns:GenWsErrorRtUser">
		<ns:errorDescr xsi:nil="true"/>
		<ns:errorCode xsi:nil="true"/>
		</pErrorRec_out>
		</ns:rgWsPublicAfmMethod>
		</env:Body>
		</env:Envelope>`;
  const response = await makeXMLRequest(hostname, path, env).catch((e) =>
    console.error(e)
  );
  if (!response) return 'Η υπηρεσία δεν λειτουργεί αυτή την στιγμή';
  return parseXMLAFMData(response);
};

module.exports = { isValid, version, afmInfo };
