"use strict";
let gameApp = angular.module('gameModule', []);

let gameController = function($scope,$http){

  $scope.naytaAloitaNappula = true; // on
  $scope.naytaJatkaNappula = false;
  $scope.kaikkiKortit = [];
  $scope.omatKortit = [];
  $scope.koneenKortit=[];
  $scope.voittaja = true; // true=sinä voitat, false = kone voittaa

  $scope.omaKortti = undefined;
  $scope.omaKuva= undefined;

  $scope.voittoKuvanNimi = undefined;
  $scope.tappioKuvanNimi = undefined;
  $scope.taustaKuvanNimi = undefined;

  $scope.naytaKortti = false; // on

  $scope.kierroksenTulos = {teksti:"", arvo:NaN};
  $scope.koneenValinta = "";

  let aktivoiOmaKortti = true;

  $scope.aloita = function(){ // on
    $http.get("peli.json")
    .then(function(response){
      $scope.naytaAloitaNappula = false;
      $scope.naytaJatkaNappula = false;
      $scope.naytaKortti = true;
      $scope.aktivoidaankoArvo = new Array($scope.kaikkiKortit.length/2);

      $scope.voittoKuvanNimi = response.data.voittoKuvanNimi;
      $scope.tappioKuvanNimi = response.data.tappioKuvanNimi;
      $scope.taustaKuvanNimi = response.data.taustaKuvanNimi;
      $scope.polku = response.data.kuvienKansio;

      $scope.kaikkiKortit = $scope.sekoitaKortit(response.data.kortit);
      $scope.jaaKortit();
    })
    .catch(function(err) {
      console.log("Tiedostoa ei löytynyt!");
    });
  };


   $scope.sekoitaKortit = function(kortit) { // tee paremmin jotta tiedät mitä tapahtuu
     for (var i = kortit.length - 1; i > 0; i--) {
       var j = Math.floor(Math.random() * (i + 1));
       var temp = kortit[i];
       kortit[i] = kortit[j];
       kortit[j] = temp;
     }
     return kortit;
  }

  $scope.jaaKortit = function(){
    for(var i=0; i<$scope.kaikkiKortit.length; i=i+2){
      $scope.omatKortit.push($scope.kaikkiKortit[i]);
      $scope.koneenKortit.push($scope.kaikkiKortit[i+1]);
    }
    $scope.piirraKortti($scope.omatKortit[0], true);
    $scope.piirraTyhjäKortti($scope.koneenKortit[0], false);
  };


  $scope.piirraKortti = function(kortti, pelaaja){
    if(pelaaja){
      $scope.omaKortti = kortti.ominaisuudet;
      $scope.omaKuva = kortti.kuvanNimi;
      $scope.omaNimi = kortti.nimi;
    } else {
      $scope.koneenKortti = kortti.ominaisuudet;
      $scope.koneenKuva = kortti.kuvanNimi;
      $scope.koneenNimi = kortti.nimi;
    }
  }

  $scope.piirraTyhjäKortti = function(tmp, pelaaja){
    let kortti = angular.copy(tmp.ominaisuudet);
    for(let key of Object.keys(kortti)){
      kortti[key] = '-';
    }
    if(pelaaja){
      $scope.omaKortti = kortti;
      $scope.omaKuva = $scope.taustaKuvanNimi;
      $scope.omaNimi = '?';
    } else {
      $scope.koneenKortti = kortti;
      $scope.koneenKuva = $scope.taustaKuvanNimi;
      $scope.koneenNimi = '?';
    }
  }

  $scope.paalla = function(indeksi, value){
    if(value){
      $scope.aktivoidaankoArvo[indeksi] = true;
    } else {
      $scope.aktivoidaankoArvo[indeksi] = false;
    }
  }

  $scope.onkoHiiriPaalla = function(indeksi){
    if(aktivoiOmaKortti)
      return $scope.aktivoidaankoArvo[indeksi];
  }


  $scope.pelaaKierros = function(indeksi, pelaaja){
    $scope.naytaJatkaNappula = true;
    aktivoiOmaKortti = false;
    let koneenKortinOminaisuudet = Object.keys($scope.koneenKortti);
    if(pelaaja){
      $scope.piirraKortti($scope.koneenKortit[0], false);
    } else {
      $scope.piirraKortti($scope.omatKortit[0], true);
      $scope.koneenValinta = "Kone valitsee: " + koneenKortinOminaisuudet[indeksi] + ".";
    }

    let omanKortinArvot = Object.values($scope.omaKortti);
    let koneenKortinArvot = Object.values($scope.koneenKortti);

    if(omanKortinArvot[indeksi] > koneenKortinArvot[indeksi]){
      $scope.kierroksenTulos.teksti = "Sinä voitit, paina Jatka-nappulaa";
      $scope.kierroksenTulos.tulos = 1;

      let kortti = $scope.omatKortit.shift();
      $scope.omatKortit.push(kortti);
      kortti = $scope.koneenKortit.shift();
      $scope.omatKortit.push(kortti);

    } else if(omanKortinArvot[indeksi] < koneenKortinArvot[indeksi]){
        $scope.kierroksenTulos.teksti = "Kone voitti ja saa valita, paina Jatka-nappulaa";
        $scope.kierroksenTulos.tulos = 2;

        let kortti = $scope.omatKortit.shift();
        $scope.koneenKortit.push(kortti);
        kortti = $scope.koneenKortit.shift();
        $scope.koneenKortit.push(kortti);

    } else {
      if(pelaaja){
        $scope.kierroksenTulos.teksti = "Tasapeli, saat jatkaa, paina Jatka-nappulaa";
        $scope.kierroksenTulos.tulos = 1;
      } else {
        $scope.kierroksenTulos.teksti = "Tasapeli, kone saa valita, paina Jatka-nappulaa";
        $scope.kierroksenTulos.tulos = 2;
      }
      let kortti = $scope.omatKortit.shift();
      $scope.omatKortit.push(kortti);
      kortti = $scope.koneenKortit.shift();
      $scope.koneenKortit.push(kortti);
    }

    // päättyikö peli?
    if($scope.omatKortit.length==0 || $scope.koneenKortit.length==0){
      $scope.naytaAloitaNappula = true;
      $scope.naytaJatkaNappula = false;
      $scope.omaKortti = [];
      $scope.koneenKortti = [];

      if($scope.koneenKortit.length==0){

        $scope.omaKuva = $scope.voittoKuvanNimi;
        $scope.koneenKuva = $scope.tappioKuvanNimi;
        $scope.kierroksenTulos.teksti = "VOITTO!!!";
      } else {
        $scope.koneenValinta = "";
        $scope.omaKuva = $scope.tappioKuvanNimi;
        $scope.koneenKuva = $scope.voittoKuvanNimi;
        $scope.kierroksenTulos.teksti = "TAPPIO!!!";
      }
      $scope.omaNimi = '';
      $scope.koneenNimi = '';


    }
  };

  $scope.uusiKierros = function(tulos){
    if(tulos === 1){
      $scope.koneenValinta = "";
      $scope.kierroksenTulos.teksti = "Valitse ominaisuus.";
      $scope.piirraKortti($scope.omatKortit[0], true);
      $scope.piirraTyhjäKortti($scope.koneenKortit[0], false);
      aktivoiOmaKortti = true;

    } else {
      $scope.koneenValinta = "Kone valitsee...";
      $scope.piirraKortti($scope.koneenKortit[0], false);
      $scope.piirraTyhjäKortti($scope.omatKortit[0], true);

      let koneenArvaus = Math.floor(Math.random()*($scope.kaikkiKortit.length/2));

      let koneenKortinOminaisuudet = Object.keys($scope.koneenKortit[0].ominaisuudet);
      $scope.koneenValinta += "Koneen valinta: " + koneenKortinOminaisuudet[koneenArvaus];
      $scope.pelaaKierros(koneenArvaus, false);
    }
  };

};


gameApp.controller('gameController', gameController);
