import { PrismaClient, Condition, ProductStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("→ Nettoyage…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.partRequest.deleteMany();
  await prisma.productCompatibility.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.vehicleType.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ Utilisateurs…");
  const [manager, courier, client, seller] = await Promise.all([
    prisma.user.create({
      data: { name: "Félix Ouédraogo", phone: "70000001", email: "felix@felixmecanic.bf", passwordHash: await bcrypt.hash("felix2026", 10), role: Role.MANAGER, city: "Ouagadougou" },
    }),
    prisma.user.create({
      data: { name: "Issa Sawadogo", phone: "70000002", passwordHash: await bcrypt.hash("livreur2026", 10), role: Role.COURIER, city: "Ouagadougou" },
    }),
    prisma.user.create({
      data: { name: "Awa Kaboré", phone: "70000003", passwordHash: await bcrypt.hash("client2026", 10), role: Role.BUYER, city: "Ouagadougou", address: "Secteur 30, Ouaga 2000" },
    }),
    prisma.user.create({
      data: { name: "Moussa Zongo", phone: "70000004", passwordHash: await bcrypt.hash("vendeur2026", 10), role: Role.BUYER, city: "Bobo-Dioulasso", address: "Secteur 22, Accart-Ville" },
    }),
  ]);

  console.log("→ Catégories…");
  const categoriesData = [
    ["Moteur", "engine"],
    ["Freinage", "brake"],
    ["Suspension & direction", "suspension"],
    ["Électrique & batterie", "zap"],
    ["Filtres & entretien", "filter"],
    ["Pneus & jantes", "circle-dot"],
    ["Transmission", "cog"],
    ["Carrosserie", "car-front"],
    ["Éclairage", "lightbulb"],
    ["Refroidissement", "thermometer"],
    ["Échappement", "wind"],
    ["Accessoires", "package"],
  ] as const;
  const categories: Record<string, string> = {};
  for (const [i, [name, icon]] of categoriesData.entries()) {
    const c = await prisma.category.create({ data: { name, slug: slugify(name), icon, sortOrder: i } });
    categories[slugify(name)] = c.id;
  }

  console.log("→ Référentiel véhicules…");
  const catalogue: Array<{ type: string; icon: string; brands: Array<{ name: string; models: string[] }> }> = [
    {
      type: "Voiture",
      icon: "car",
      brands: [
        { name: "Toyota", models: ["Corolla", "Hilux", "Land Cruiser", "RAV4", "Yaris", "Hiace"] },
        { name: "Mercedes-Benz", models: ["Classe C", "Classe E", "190", "Sprinter"] },
        { name: "Peugeot", models: ["206", "307", "406", "Partner"] },
        { name: "Hyundai", models: ["Accent", "Tucson", "Santa Fe", "H1"] },
        { name: "Renault", models: ["Clio", "Logan", "Kangoo"] },
        { name: "Nissan", models: ["Patrol", "Navara", "Sunny"] },
        { name: "Kia", models: ["Picanto", "Sportage", "Rio"] },
      ],
    },
    {
      type: "Moto",
      icon: "bike",
      brands: [
        { name: "Yamaha", models: ["Crypton", "YBR 125", "AG 100", "DT 125"] },
        { name: "Honda", models: ["CG 125", "Wave", "XL 125"] },
        { name: "Sanya", models: ["SY 125", "SY 150"] },
        { name: "Haojue", models: ["HJ 125", "HJ 150"] },
        { name: "Apsonic", models: ["AP 125", "AP 150"] },
        { name: "KTM (Kenbo)", models: ["KTM 125", "KTM 150"] },
        { name: "Sanili", models: ["SL 125"] },
      ],
    },
    {
      type: "Vélo",
      icon: "bike",
      brands: [
        { name: "Phoenix", models: ["Classique 26\"", "Cargo"] },
        { name: "Flying Pigeon", models: ["PA-02"] },
        { name: "Générique", models: ["VTT 26\"", "Ville 28\""] },
      ],
    },
    {
      type: "Tricycle",
      icon: "truck",
      brands: [
        { name: "Zongshen", models: ["ZS 200", "ZS 250"] },
        { name: "Sanya", models: ["Tricycle 200"] },
      ],
    },
  ];

  const types: Record<string, string> = {};
  const brands: Record<string, string> = {}; // "type/brand" → id
  const models: Record<string, string> = {}; // "type/brand/model" → id
  for (const [i, t] of catalogue.entries()) {
    const vt = await prisma.vehicleType.create({ data: { name: t.type, slug: slugify(t.type), icon: t.icon, sortOrder: i } });
    types[t.type] = vt.id;
    for (const b of t.brands) {
      const br = await prisma.brand.create({ data: { name: b.name, slug: slugify(b.name), vehicleTypeId: vt.id } });
      brands[`${t.type}/${b.name}`] = br.id;
      for (const m of b.models) {
        const mo = await prisma.vehicleModel.create({ data: { name: m, slug: slugify(m), brandId: br.id } });
        models[`${t.type}/${b.name}/${m}`] = mo.id;
      }
    }
  }

  console.log("→ Pièces…");
  type Seed = {
    title: string;
    desc: string;
    price: number;
    cat: string;
    type: string;
    brand?: string;
    compat?: string[];
    condition?: Condition;
    qty?: number;
    ref?: string;
    img: string;
    status?: ProductStatus;
    seller?: string;
    featured?: boolean;
  };
  const items: Seed[] = [
    { title: "Plaquettes de frein avant Toyota Corolla", desc: "Jeu de 4 plaquettes avant, qualité OEM. Compatibles Corolla 2008-2018. Livrées avec clips.", price: 18500, cat: "freinage", type: "Voiture", brand: "Toyota", compat: ["Corolla", "Yaris"], condition: "NEW", qty: 12, ref: "04465-02220", img: "freinage", featured: true },
    { title: "Alternateur Toyota Hilux 2.5 D4D", desc: "Alternateur 12V 100A, testé sur banc. Garantie 3 mois.", price: 95000, cat: "electrique-batterie", type: "Voiture", brand: "Toyota", compat: ["Hilux", "Land Cruiser"], condition: "REFURBISHED", qty: 2, ref: "27060-30040", img: "electrique", featured: true },
    { title: "Filtre à huile Toyota (universel série 90915)", desc: "Filtre à huile d'origine, adapté à la majorité des moteurs essence Toyota.", price: 4500, cat: "filtres-entretien", type: "Voiture", brand: "Toyota", compat: ["Corolla", "Yaris", "RAV4"], condition: "NEW", qty: 40, ref: "90915-YZZE1", img: "filtres" },
    { title: "Radiateur Mercedes 190 / Classe C W202", desc: "Radiateur aluminium neuf, sans fuite. Idéal pour la chaleur de Ouaga.", price: 85000, cat: "refroidissement", type: "Voiture", brand: "Mercedes-Benz", compat: ["190", "Classe C"], condition: "NEW", qty: 3, img: "refroidissement" },
    { title: "Amortisseurs avant Peugeot 406 (paire)", desc: "Paire d'amortisseurs avant gaz, neufs. Montage possible chez nos partenaires.", price: 62000, cat: "suspension-direction", type: "Voiture", brand: "Peugeot", compat: ["406"], condition: "NEW", qty: 4, img: "suspension", featured: true },
    { title: "Phare avant droit Hyundai Accent 2012", desc: "Optique avant droit, verre clair, sans fissure. Occasion en très bon état.", price: 35000, cat: "eclairage", type: "Voiture", brand: "Hyundai", compat: ["Accent"], condition: "USED", qty: 1, img: "eclairage", seller: "seller" },
    { title: "Batterie 12V 70Ah (Bosch S4)", desc: "Batterie neuve sans entretien, garantie 12 mois. Convient à la plupart des berlines et 4x4.", price: 78000, cat: "electrique-batterie", type: "Voiture", condition: "NEW", qty: 8, img: "electrique", featured: true },
    { title: "Kit embrayage Toyota Hiace 2.7", desc: "Disque + mécanisme + butée. Qualité Aisin.", price: 110000, cat: "transmission", type: "Voiture", brand: "Toyota", compat: ["Hiace"], condition: "NEW", qty: 2, img: "transmission" },
    { title: "Pare-chocs avant Toyota Corolla 2015", desc: "Pare-chocs avant à peindre, ABS neuf.", price: 55000, cat: "carrosserie", type: "Voiture", brand: "Toyota", compat: ["Corolla"], condition: "NEW", qty: 2, img: "carrosserie" },
    { title: "Silencieux d'échappement Renault Logan", desc: "Silencieux arrière neuf avec colliers.", price: 42000, cat: "echappement", type: "Voiture", brand: "Renault", compat: ["Logan"], condition: "NEW", qty: 3, img: "echappement" },
    { title: "Pneu 205/55 R16 (Sunfull)", desc: "Pneu neuf, fabriqué en 2025. Prix unitaire, montage disponible.", price: 45000, cat: "pneus-jantes", type: "Voiture", condition: "NEW", qty: 16, img: "pneus" },
    { title: "Moteur complet Toyota 2NZ-FE 1.3", desc: "Moteur d'occasion importé, 98 000 km, compression vérifiée. Vendu avec boîte.", price: 650000, cat: "moteur", type: "Voiture", brand: "Toyota", compat: ["Yaris"], condition: "USED", qty: 1, img: "moteur", seller: "seller" },

    { title: "Kit chaîne Yamaha Crypton (chaîne + pignons)", desc: "Kit chaîne renforcé 428, 15/36 dents. Le plus vendu sur les motos de Ouaga.", price: 12500, cat: "transmission", type: "Moto", brand: "Yamaha", compat: ["Crypton"], condition: "NEW", qty: 30, img: "transmission", featured: true },
    { title: "Plaquettes de frein Honda CG 125", desc: "Plaquettes avant à disque, qualité supérieure.", price: 3500, cat: "freinage", type: "Moto", brand: "Honda", compat: ["CG 125"], condition: "NEW", qty: 50, img: "freinage" },
    { title: "Batterie moto 12V 5Ah gel", desc: "Batterie gel sans entretien, compatible la plupart des motos 100-150cc.", price: 14000, cat: "electrique-batterie", type: "Moto", condition: "NEW", qty: 25, img: "electrique" },
    { title: "Carburateur Sanya SY 125", desc: "Carburateur complet neuf, réglé d'usine.", price: 18000, cat: "moteur", type: "Moto", brand: "Sanya", compat: ["SY 125", "SY 150"], condition: "NEW", qty: 10, img: "moteur" },
    { title: "Pneu moto 2.75-17 (avant)", desc: "Pneu avant neuf, bonne tenue sur latérite.", price: 9500, cat: "pneus-jantes", type: "Moto", condition: "NEW", qty: 20, img: "pneus", featured: true },
    { title: "Phare LED universel moto", desc: "Phare LED rond 12V, faisceau blanc puissant. Faible consommation.", price: 8500, cat: "eclairage", type: "Moto", condition: "NEW", qty: 15, img: "eclairage" },
    { title: "Amortisseurs arrière Apsonic AP 125 (paire)", desc: "Paire d'amortisseurs arrière réglables.", price: 16000, cat: "suspension-direction", type: "Moto", brand: "Apsonic", compat: ["AP 125", "AP 150"], condition: "NEW", qty: 6, img: "suspension" },
    { title: "Filtre à air Haojue HJ 125", desc: "Filtre à air mousse lavable.", price: 2500, cat: "filtres-entretien", type: "Moto", brand: "Haojue", compat: ["HJ 125"], condition: "NEW", qty: 35, img: "filtres" },
    { title: "Piston + segments Yamaha AG 100", desc: "Kit piston cote standard, avec axe et clips.", price: 11000, cat: "moteur", type: "Moto", brand: "Yamaha", compat: ["AG 100"], condition: "NEW", qty: 5, img: "moteur", seller: "seller" },

    { title: "Chambre à air vélo 26\"", desc: "Chambre à air valve Schrader, renforcée.", price: 1500, cat: "pneus-jantes", type: "Vélo", condition: "NEW", qty: 60, img: "pneus" },
    { title: "Chaîne vélo 1/2 x 1/8", desc: "Chaîne mono-vitesse 112 maillons, avec attache rapide.", price: 3000, cat: "transmission", type: "Vélo", brand: "Phoenix", compat: ["Classique 26\"", "Cargo"], condition: "NEW", qty: 25, img: "transmission" },
    { title: "Patins de frein vélo (jeu de 4)", desc: "Patins caoutchouc pour freins V-brake et cantilever.", price: 1200, cat: "freinage", type: "Vélo", condition: "NEW", qty: 40, img: "freinage" },
    { title: "Selle confort vélo ville", desc: "Selle large avec ressorts, gel.", price: 4500, cat: "accessoires", type: "Vélo", condition: "NEW", qty: 12, img: "accessoires" },

    { title: "Kit chaîne Zongshen ZS 200 tricycle", desc: "Chaîne 520 renforcée + pignons, pour tricycle de charge.", price: 22000, cat: "transmission", type: "Tricycle", brand: "Zongshen", compat: ["ZS 200"], condition: "NEW", qty: 8, img: "transmission" },
    { title: "Pneu tricycle 4.00-12", desc: "Pneu arrière renforcé pour charge lourde.", price: 21000, cat: "pneus-jantes", type: "Tricycle", condition: "NEW", qty: 10, img: "pneus" },
  ];

  let n = 0;
  for (const it of items) {
    const brandId = it.brand ? brands[`${it.type}/${it.brand}`] : undefined;
    const compat = (it.compat ?? []).map((m) => models[`${it.type}/${it.brand}/${m}`]).filter(Boolean);
    const isSellerItem = it.seller === "seller";
    await prisma.product.create({
      data: {
        title: it.title,
        slug: `${slugify(it.title)}-${(++n).toString(36)}`,
        description: it.desc,
        price: it.price,
        condition: it.condition ?? "USED",
        status: it.status ?? "APPROVED",
        quantity: it.qty ?? 1,
        reference: it.ref,
        featured: it.featured ?? false,
        categoryId: categories[it.cat],
        vehicleTypeId: types[it.type],
        brandId,
        sellerId: isSellerItem ? seller.id : null,
        pickupCity: isSellerItem ? "Bobo-Dioulasso" : "Ouagadougou",
        pickupAddress: isSellerItem ? "Secteur 22, Accart-Ville" : "Boutique Felix Mécanic, Zone 1",
        pickupPhone: isSellerItem ? "70000004" : "70000001",
        reviewedById: manager.id,
        reviewedAt: new Date(),
        images: { create: [{ url: `/images/parts/${it.img}.svg`, alt: it.title, sortOrder: 0 }] },
        compatibilities: { create: compat.map((modelId) => ({ modelId })) },
      },
    });
  }

  // Annonces en attente de validation (soumises par un vendeur)
  await prisma.product.create({
    data: {
      title: "Boîte de vitesses Peugeot 307 1.6 HDi",
      slug: "boite-vitesses-peugeot-307-pending",
      description: "Boîte manuelle 5 vitesses, démontée d'un véhicule accidenté. Fonctionne parfaitement.",
      price: 180000,
      condition: "USED",
      status: "PENDING",
      quantity: 1,
      categoryId: categories["transmission"],
      vehicleTypeId: types["Voiture"],
      brandId: brands["Voiture/Peugeot"],
      sellerId: seller.id,
      pickupCity: "Bobo-Dioulasso",
      pickupAddress: "Secteur 22, Accart-Ville",
      pickupPhone: "70000004",
      images: { create: [{ url: "/images/parts/transmission.svg", sortOrder: 0 }] },
      compatibilities: { create: [{ modelId: models["Voiture/Peugeot/307"] }] },
    },
  });
  await prisma.product.create({
    data: {
      title: "Jante alu 15\" Toyota RAV4 (x4)",
      slug: "jantes-alu-rav4-pending",
      description: "Lot de 4 jantes aluminium d'origine, sans voile.",
      price: 120000,
      condition: "USED",
      status: "PENDING",
      quantity: 1,
      categoryId: categories["pneus-jantes"],
      vehicleTypeId: types["Voiture"],
      brandId: brands["Voiture/Toyota"],
      sellerId: client.id,
      pickupCity: "Ouagadougou",
      pickupAddress: "Secteur 30, Ouaga 2000",
      pickupPhone: "70000003",
      images: { create: [{ url: "/images/parts/pneus.svg", sortOrder: 0 }] },
      compatibilities: { create: [{ modelId: models["Voiture/Toyota/RAV4"] }] },
    },
  });

  console.log("→ Demandes de pièces…");
  await prisma.partRequest.create({
    data: {
      userId: client.id,
      contactName: client.name,
      contactPhone: client.phone,
      title: "Pompe à injection Nissan Patrol Y61",
      description: "Pompe à injection pour moteur TD42, année 2005.",
      modelText: "Patrol Y61 TD42 2005",
      vehicleTypeId: types["Voiture"],
      brandId: brands["Voiture/Nissan"],
      status: "IN_PROGRESS",
      managerNote: "Contact pris avec un fournisseur à Lomé.",
    },
  });

  console.log("✔ Base de démonstration prête.");
  console.log("   Gestionnaire : 70000001 / felix2026");
  console.log("   Livreur      : 70000002 / livreur2026");
  console.log("   Client       : 70000003 / client2026");
  console.log("   Vendeur      : 70000004 / vendeur2026");
  void courier;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
