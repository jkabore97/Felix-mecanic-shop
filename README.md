# Felix Mécanic — vitrine de pièces mécaniques (Burkina Faso)

Plateforme web pour afficher et vendre des pièces détachées (voitures, motos, vélos, tricycles) au Burkina Faso.
Interface en français, prix en FCFA, paiement Orange Money / Moov Money ou à la livraison, livraison par coursier.

## Fonctionnalités

**Vitrine publique (sans compte)**
- Accueil : recherche, types de véhicules et catégories réellement disponibles, sélection de pièces.
- Catalogue avec filtres à facettes : véhicule → marque → modèle, catégorie, état, prix, tri. Un filtre n'apparaît que s'il existe au moins une pièce correspondante.
- Fiche pièce : galerie, compatibilités (modèles), état, stock, pièces similaires.
- Panier (stocké dans le navigateur) → l'inscription n'est demandée qu'au moment de commander.
- Demande de pièce introuvable (nom, photo, véhicule, modèle) — possible sans compte.

**Acheteur / vendeur (compte client, connexion par numéro de téléphone)**
- Commande : adresse, ville (frais de livraison), Orange Money / Moov Money / paiement à la livraison, référence de transaction.
- Suivi de commande en 5 étapes, historique dans « Mon compte ».
- Proposer une pièce à la vente (photos, prix, compatibilités, adresse de récupération). L'annonce passe en **attente de validation** ; le vendeur reste anonyme pour l'acheteur.
- Suivi de ses annonces et de ses demandes de pièces.

**Gestionnaire (`/admin`)**
- Tableau de bord, validation / refus des annonces avec note au vendeur, mise en avant, prix et stock.
- Ajout direct au stock Felix Mécanic (publié immédiatement).
- Commandes : confirmation du paiement, assignation d'un livreur, changement de statut, annulation (remise en stock automatique).
- Demandes de pièces : statut et réponse visible par le client.
- Référentiel véhicules (types, marques, modèles) et catégories — seul le gestionnaire peut les créer.
- Utilisateurs : promotion d'un compte en livreur ou gestionnaire.

**Livreur (`/livreur`)**
- Liste des courses assignées : où récupérer (vendeur), où livrer (acheteur), montant à encaisser, boutons « récupérée » / « livrée ».

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 · SQLite (dev) · bcryptjs · zod · lucide-react.

## Démarrage

```bash
npm install            # génère aussi le client Prisma
cp .env.example .env   # DATABASE_URL + SESSION_SECRET
npm run db:push        # crée la base SQLite
npm run db:seed        # données de démonstration
npm run dev            # http://localhost:3000
```

Comptes de démonstration (mot de passe entre parenthèses) :

| Rôle          | Téléphone | Mot de passe  |
| ------------- | --------- | ------------- |
| Gestionnaire  | 70000001  | `felix2026`   |
| Livreur       | 70000002  | `livreur2026` |
| Client        | 70000003  | `client2026`  |
| Vendeur       | 70000004  | `vendeur2026` |

Autres scripts : `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm run db:reset`.

## Structure

```
prisma/schema.prisma      modèle de données (User, Product, Order, PartRequest, VehicleType/Brand/Model, Category…)
prisma/seed.ts            données de démo (référentiel BF, pièces, comptes)
src/app                   pages (App Router) : /, /catalogue, /piece/[slug], /panier, /commande, /vendre, /demande, /compte, /admin/*, /livreur
src/actions               server actions : auth, orders, listings, admin, courier
src/lib                   prisma, auth (sessions cookie), catalog (recherche + facettes), cart (localStorage), upload, format, delivery
src/components            UI partagée (header, cartes produit, formulaires…)
public/images/parts       illustrations SVG de démonstration
data/uploads              photos envoyées par les utilisateurs, servies par /uploads/[name] (ignoré par git)
```

## Mise en production

- **Base de données** : passer `provider = "postgresql"` dans `prisma/schema.prisma` et `DATABASE_URL` vers PostgreSQL (Neon, Supabase, Railway…), puis `prisma migrate deploy`.
- **Images** : `src/lib/upload.ts` écrit dans `data/uploads` (variable `UPLOAD_DIR`) et `/uploads/[name]` les sert. Sur un hébergement sans disque persistant (Vercel), remplacer par un stockage objet (Cloudinary, S3, UploadThing).
- **Paiement** : le flux Mobile Money est manuel (référence saisie par le client, validation par le gestionnaire). Une intégration API Orange Money / Moov Money ou un agrégateur (CinetPay, PayDunya, FedaPay) peut remplacer cette étape sans changer le modèle de commande.
- **Notifications** : ajouter SMS / WhatsApp (Twilio, Orange SMS API) sur les changements de statut de commande et de validation d'annonce.
- **Sécurité** : définir un `SESSION_SECRET` fort, activer HTTPS, limiter les tentatives de connexion.
- **Frais de livraison** : `src/lib/delivery.ts` (villes et tarifs) ; à déplacer en base si le gestionnaire doit les modifier lui-même.

## Conseils de design pour la vitrine

Voir la section « Recommandations » ci-dessous ; les choix implémentés :

- **Doux + futuriste** : fond clair chaud, encre bleu nuit, accent turquoise électrique, grands rayons (28 px), ombres diffuses, halos lumineux, quadrillage discret dans le héro, prix en police mono.
- **Mobile d'abord** : barre de navigation basse (Accueil, Catalogue, Vendre, Panier, Compte), filtres repliables, cartes 2 colonnes, images légères (SVG / lazy loading).
- **Zéro filtre vide** : les facettes sont calculées à partir des pièces en ligne uniquement.
- **Confiance** : badges « Stock Felix Mécanic » / « Pièce d'un particulier · vérifiée », rappels livraison / paiement / vérification sur chaque fiche.
- **Rareté utile** : « Dernière pièce », « Stock limité » sur les cartes.

### Recommandations pour la suite

1. **Sélecteur « Mon véhicule »** persistant (type → marque → modèle) en haut de la vitrine : tout le catalogue se filtre automatiquement, et l'acheteur voit « Compatible avec votre Corolla » sur chaque carte.
2. **Photos réelles, fond neutre** : imposer 2 à 6 photos, proposer un guide de prise de vue dans le formulaire vendeur ; compresser côté serveur (WebP, 1200 px).
3. **Recherche tolérante** : références OEM, fautes de frappe, synonymes (« plaquettes » / « garnitures ») — passer à une recherche full-text (PostgreSQL `tsvector` ou Meilisearch).
4. **WhatsApp comme canal** : bouton « Demander sur WhatsApp » sur les fiches et les demandes de pièce ; c'est le canal le plus utilisé par la clientèle locale.
5. **PWA** : manifest + service worker pour installer l'app sur Android, cache des images, fonctionnement dégradé hors ligne.
6. **Mode sombre** optionnel pour l'ambiance « atelier futuriste » ; les jetons de couleur sont déjà centralisés dans `globals.css`.
