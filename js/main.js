// Facendo una chiamata GET all’endpoint /sales​, ​l’API ci ritornerà la lista di tutte le vendite fatte dai venditori dell’azienda
// 1. Andamento delle vendite totali della nostra azienda con un grafico di tipo Line
// con un unico dataset che conterrà il numero di vendite totali mese per mese nel 2017.
// 2. il secondo grafico è quello a torta che evidenzierà il contributo di ogni venditore per l’anno 2017.
// Il valore dovrà essere la percentuale di vendite effettuate da quel venditore (fatturato_del venditore / fatturato_totale)

// input da stringa

// 1.ajax e API
// 2. se succede più di una cosa in succes richiamo una funzione dentro SUCCESS
$(document).ready(function () {

    var baseUrl = 'http://157.230.17.132:4020/sales'; // inseriro in questa variabile il mio url perchè è sempre riutilizzabile
    stampaGrafici();

    //MILESTONE 2
    /*
    Ora vogliamo dare la possibilità di aggiungere vendite.
    Creiamo due select, una contenente i nostri venditori e l’altra contenente i mese dell’anno e una input per inserire il valore della vendita.
    Aggiungiamo un bottone e onClick dovremo aggiungere una vendita del valore inserito al venditore selezionato per il mese selezionato, facendo una chiamata POST a /sales.
    I grafici andranno modificati mostrando i nuovi dati.
    */

    $('#btn-invia').click(function () {
        var nomeVenditore = $('#sel-venditore').val();
        var dataVendita = $('#input-data').val();
        var dataVenditaFormattata = moment(dataVendita, 'YYYY-MM-DD').format('DD/MM/YYYY');
        var vendita = parseInt($('#input-vendita').val());
        // chiamata post
        $.ajax({
            url: baseUrl,
            method: 'POST',
            data: {
                salesman: nomeVenditore,
                amount: vendita,
                date: dataVenditaFormattata
            },
            success: function (data) {
                //log(data)
                stampaGrafici();
            },
            error: function (err) {
                alert('errore');
            }
        });
    });

    function stampaGrafici() {
        $.ajax ({
            url: baseUrl, //inserire api
            method: 'GET',
            success: function (data) {
                // facendo il log di data esce array con tutti gli oggetti dell'api

                // elaboro dati ricevuti dal server per farne due array
                // do a chart.js i due array
                // operazione da svolgere per i due grafici, alla funzione meglio dare un solo compito
                var datiMensili = costruttoreDatiMensili(data); // elaboriamo i dati della get per renderli digeribili da chart.js (ritorna un oggetto)
                // console.log(arrayMonth.mesi);
                createLineChart(datiMensili.mesi, datiMensili.vendite); // diamo in pasto a chart.js le labels e data ricavati dall'ogg dati mensili
                var fatturato = fatturatoTotale(data);
                var datiVenditori = costruttoreDatiVenditori(data, fatturato);
                // log datiVenditori ci da due array con oggetti
                createPieChart(datiVenditori.venditori, datiVenditori.vendite);
            },
            error: function (err) {
                alert('Errore API: ' + err)
            }
        });
    }

    function costruttoreDatiMensili(vendite) {
        // inizializziamo i dati delle vendite mensili settate a 0
        var venditeMensili = {
            // oggeto formate da tutte chiavi che ci arrivano dal server e trasformiamo in chiavi
            gennaio: 0,
            febbraio: 0,
            marzo: 0,
            aprile: 0,
            maggio: 0,
            giugno: 0,
            luglio: 0,
            agosto: 0,
            settembre: 0,
            ottobre: 0,
            novembre: 0,
            dicembre: 0
        };
        //  moment ci permette di tirare fuori da un numero un mese
        // var arrayMonths = moment.months();
        // il log ci da un oggetto messo in ordine alfabetico e in italiano
        // lo scopo è aggiunger ogni volta per questo serve un oggetto

        // il ciclo for ci permette di ciclare i dati dell api in questo caso le vendite,
        // per aggiungere .amount all'ogg vendite mensili
        for (var i = 0; i < vendite.length; i++) {
            var vendita = vendite[i]; //valuto ogni singola vendita
            //  con il log ci stampiamo uno per uno la vendita
            //  vado nel singolo ogg estrapolo la data con moment.js lo trasformo in numero
            var dataVendita = vendita.date; //estrapolo la data dalogg vendita-----.date perchè nell'ogg è in date
            // creiamo un format per creare un format della data diverso meglio riconosciuto da moment.js
            var meseVendita = moment(dataVendita, 'DD/MM/YYYY').format('MMMM'); //trasformo la data nel relativo nome del mese---- A MOMENTI STO DICENDO CHE LA DATA è COSI e la trasformo in un mese
            // infatti mese vendita è diventato un valore che possiamo confrontare (mese)
            venditeMensili[meseVendita] += parseInt(vendita.amount); // a = a + b -----> a += b.-----uso il nome del mese appena ricevuto per riconoscere la chiave nel'ogg venditeMensili a questa la vendita
            // console.log()--ci da le singole vendite di ogni venditore
            // prendo il mesevendita estrapolato da vendite mesili con il format
            // uso mesevendita come chiave di vendite mensili
            // venditeMensili['gennaio'] = 5;
        }
        // creare due array da dare in pasto a chart.js
        var arrayMesi = []; // inizializzo i due array
        var arrayVendite = [];
        //  adesso vanno riempiti, facciamo un ciclo in vendite mesi in mesi inseriamo le chiavi e in vendite i dati sommati
        for (var nomeMese in venditeMensili) { //ciclo all'interno di ogg vendite mensili per inserire/trasformare la coppia data valore nei relativi array
            arrayMesi.push(nomeMese); //inserisco il nome del mese nell arrayMesi
            arrayVendite.push(venditeMensili[nomeMese]); // inserisco in arrayVnedite la somma di tutte le vendite in quel mese
        }
        // facciamo log(arrayMesi, arrayVendite) e abbiamo i due array
        // --abbiamo due array e fari ritornare alla nostra funzione
        // li impacchettiamo in un oggeto
        return {
            mese: arrayMesi,
            vendita: arrayVendite
        };
    }

    function createLineChart(arrayLabels, arrayData) {
        var ctx = $('#line-chart');
        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: arrayLabels,
                datasets: [{
                    label: 'Vendite Mensili',
                    borderColor: 'darkblue',
                    lineTension: 0,
                    data: arrayData
                }]
            }
        });
    }

    function fatturatoTotale(vendite) {
        var fatturato = 0;
        for (var i = 0; i < vendite.length; i++) {
            var vendita = vendite[i];
            fatturato += parseInt(vendita.amount);
        }
        return fatturato;
    }

    function costruttoreDatiVenditori(vendite, fatturatoAziendale) {
        var venditeVenditori = {};//creazione oggetto vuoto che assumerà la somma vendite annuali del singole venditore
        for (var i = 0; i < vendite.length; i++) {// ciclo for nell'array della get
            var vendita = vendite[i]; //  considero il singolo oggetto dell'array
            // estrapolare nome venditore da ogg vendite---
            var nomeVenditore = vendita.salesman; // associo a una variabile il nome del nomeVenditore
            // controllare se esiste la chiave che vogliamo aggiungere
            if (venditeVenditori[nomeVenditore] === undefined) { // se non esiste una chiave  con il nome di quel venditore la inizializzo con il numero 0
                venditeVenditori[nomeVenditore] = 0;
            }
            venditeVenditori[nomeVenditore] += parseInt(vendita.amount); // sommo la vendita dell'ogg attuale a quel venditore
        }
        var arrayVenditori = []; // inizializzo i due array
        var arrayVendite = [];
        //  adesso vanno riempiti, facciamo un ciclo in vendite mesi in mesi inseriamo le chiavi e in vendite i dati sommati
        for (var nomeVenditore in venditeVenditori) { //ciclo all'interno di ogg vendite mensili per inserire/trasformare la coppia data valore nei relativi array
            arrayVenditori.push(nomeVenditore); //inserisco il nome del vendi nell arrayMesi
            var fatturatoPercentuleVenditore = ((venditeVenditori[nomeVenditore] / fatturatoAziendale) * 100).toFixed(2);
            arrayVendite.push(fatturatoPercentuleVenditore); // inserisco in arrayVnedite la somma di tutte le vendite in quel mese
        }
        // facciamo log(arrayMesi, arrayVendite) e abbiamo i due array
        // --abbiamo due array e fari ritornare alla nostra funzione
        // li impacchettiamo in un oggeto
        return {
            venditori: arrayVenditori,
            vendita: arrayVendite
        };
    }

    function createPieChart(arrayLabels, arrayData) {
        var ctx = $('#pie-chart');
        var pieChart= new Chart(ctx, {
            type: 'pie',
            data: {
                datasets: [{
                    data: arrayData,
                    backgroundColor: ['Red', 'Yellow', 'Blue', 'darkorange'],
                    hoverBackgroundColor: ['lightcoral', 'khaki', 'lightblue', 'orange']
                }],
                labels: arrayLabels
            },
            options: {
                responsive: true,
                tooltips: {
                  callbacks: {
                    label: function(tooltipItem, data) {
                      return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
                    }
                  }
                }
            }
        });
    }
});
