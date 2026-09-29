// firebase.js — configuration et exports partagés pour toutes les pages
// du site du Club Réussir Ensemble (index.html, cours.html, admin.html, etc.)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYeYPOptN2wEak_Ctcr4a8t5qXpj4riLE",
  authDomain: "emploi-temps.firebaseapp.com",
  projectId: "emploi-temps",
  storageBucket: "emploi-temps.firebasestorage.app",
  messagingSenderId: "665985283894",
  appId: "1:665985283894:web:b0c4cb14824bb8fed9a597"
};

const fbApp = initializeApp(firebaseConfig);

export const fbDB = getFirestore(fbApp);
export const fbAuth = getAuth(fbApp);

/* ── Collections utilisées par le site du Club Réussir Ensemble ── */
export const C_MATIERES        = 'site_matieres';
export const C_PAIEMENTS       = 'site_paiements';
export const C_ELEVES          = 'site_eleves';
export const C_INSC            = 'site_inscriptions';
export const C_CONTACTS        = 'site_contacts';
export const C_EVENEMENTS      = 'site_evenements';
export const C_EVALUATIONS     = 'site_evaluations';
export const C_RESULTATS       = 'site_quiz_resultats';
export const C_OBJECTIFS       = 'site_objectifs';
export const C_CONFIG          = 'site_config';
export const C_VIDEOS          = 'site_videos';
export const C_EQUIPE          = 'site_equipe';
export const C_RESSOURCES      = 'site_ressources';
export const C_GAL             = 'site_galerie';
export const C_BLOG            = 'site_blog_articles';
export const C_BLOG_BROUILLONS = 'site_blog_brouillons';
export const C_OLY_INSC        = 'site_olympiades_inscriptions';
export const C_RES_EXAMENS     = 'site_resultats_examens';
export const C_PALMARES        = 'site_palmares';
export const C_QUIZ_QUEST      = 'site_quiz_questions';
export const C_BLOG_ATTENTE    = 'site_blog_commentaires_attente';
export const C_TEMOIGNAGES     = 'site_temoignages';

/* ── Fonctions Firestore / Auth ré-exportées pour que les pages
   n'aient qu'un seul fichier à importer ── */
export {
  doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
};

