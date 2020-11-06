# rgwspublic

client library for greek GSIS tax service in Nodejs

This is a port of the same named library for Go. You can find the original work [here](https://github.com/kamhlos/rgwspublic)

## Installation

```
npm install greek-afm
```

## Usage with Promises

```javascript
const afmService = require('greek-afm');

afmService.version().then((d) => console.log(d));
afmService.afmInfo('', 'AFM_NUMBER_SEARCHED', 'USERNAME', 'PASSWORD').then((d) =>
  console.log(d);
);
```

## Usage with Async/Await

There is no need to use catch, it will not reject. Errors will be in the resolve part of the promise

```javascript
const afmService = require('greek-afm');

const version = await afmService.version();
const {afmData, error} = await afmService.afmInfo('', 'AFM_NUMBER_SEARCHED', 'USERNAME', 'PASSWORD');
```

## Πληροφορίες για την Υπηρεσία

### Πρόγραμμα Πελάτης (Client)της Διαδικτυακής Εφαρμογής των ΓΓΔΕ/ΓΓΠΣ:

«Βασικά στοιχεία για νομικά πρόσωπα, νομικές οντότητες και φυσικά πρόσωπα, με εισόδημα από επιχειρηματική δραστηριότητα(public)», [Έκδοση 3.0.3:](http://www.gsis.gr/gsis/info/gsis_site/PublicIssue/wnsp/wnsp_pages/wnsp.html)

Αναλυτικές οδηγίες χρήσης της διαδικτυακής υπηρεσίας υπάρχουν [εδώ:](http://http://www.gsis.gr/gsis/info/gsis_site/News/documents_news/RgWsPublic_documentation_v3.0.1.rar)

### Υπηρεσία αναζήτησης πληροφοριών για ΑΦΜ:

http://www.gsis.gr/gsis/info/gsis_site/PublicIssue/wnsp/wnsp_pages/wnsp.html

Από τις 06/05/2014, η Γ.Γ.Π.Σ., σε συνεργασία με την Γ.Γ.Δ.Ε., ανακοίνωσαν τη λειτουργία της διαδικτυακής υπηρεσίας «Βασικά στοιχεία για νομικά πρόσωπα, νομικές οντότητες και φυσικά πρόσωπατυ με εισόδημα από επιχειρηματική δραστηριότητα(public)».

Η υπηρεσία επανασχεδίαστηκε όπως αναφέρεται στην ανακοίνωσή της ΓΓΠΣ στις 6/5/2014.

### Τα βασικά χαρακτηριστικά της υπηρεσίας είναι:

- Η υπηρεσία μπορεί να αξιοποιηθεί απ’ όλους τους πιστοποιημένους χρήστες του TAXISnet.
- Υπάρχει μηνιαίο όριο κλήσεων της υπηρεσίας.
- Ο ΑΦΜ τα στοιχεία του οποίου αναζητούνται, ενημερώνεται με ειδική ειδοποίηση, για το ΑΦΜ / ονοματεπώνυμο που έκανε την αναζήτηση.
- Μέσω της οθόνης εγγραφής στην υπηρεσία μπορεί κάποιος να εξουσιοδοτήσει ένα τρίτο ΑΦΜ να καλεί την υπηρεσία γι’ αυτόν.

### Για την χρήση της υπηρεσίας θα πρέπει ο χρήστης:

1. Να εγγραφεί στην υπηρεσία κάνοντας χρήση των TAXISnet κωδικών του.
2. Να αποδεχτεί την πολιτική ορθής χρήσης της υπηρεσίας.
3. Να αποκτήσει ειδικούς κωδικούς πρόσβασης στην υπηρεσία μέσω της εφαρμογής «Διαχείριση Ειδικών Κωδικών».

   - Τα Φυσικά Πρόσωπα μπορούν να δημιουργήσουν οι ίδιοι ειδικούς κωδικούς πρόσβασης.
   - Για τα Νομικά Πρόσωπα μόνο οι νόμιμοι εκπρόσωποί τους (όπως έχουν ορισθεί στο TAXISnet) μπορούν να αποκτήσουν γι’ αυτά ειδικούς κωδικούς πρόσβασης. Εναλλακτικά, μπορούν να χρησιμοποιήσουν το μηχανισμό των εξουσιοδοτήσεων μέσω της οθόνης εγγραφής στην υπηρεσία.

4. Να χρησιμοποιήσει ένα «πρόγραμμα πελάτη (client)» της αρεσκείας του για την κλήση της υπηρεσίας.
