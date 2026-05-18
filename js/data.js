/* ══════════════════════════════════════
   data.js — Menu categories & items
   Tisoy Sushi Maki — Full Menu

   Item shape:
     Single price  → { id, name, desc, emoji, tag?, price, images? }
     Size variants → { id, name, desc, emoji, tag?, variants: [{ size, price, note? }], images? }

   price: 0 = "Contact us for pricing"
   images: array of relative paths (e.g. 'images/filename.jpg')
══════════════════════════════════════ */

const categories = [
  { id: 'bakedsushi',   label: 'Baked Sushi',        emoji: '🫙', desc: 'Creamy baked sushi trays — served with nori' },
  { id: 'maki',         label: 'Maki Rolls',          emoji: '🌀', desc: 'Classic and specialty maki rolls (a la carte)' },
  { id: 'platters',     label: 'Maki Platters',       emoji: '🍱', desc: 'Assorted maki platters for groups' },
  { id: 'kanisalad',    label: 'Kani Salad',          emoji: '🥗', desc: 'Fresh and creamy kani salad platters' },
  { id: 'haru',         label: 'Haru Maki Salad',     emoji: '🌿', desc: 'Light and fresh haru maki salad rolls' },
  { id: 'birthdaysets', label: 'Birthday Sets',       emoji: '🎂', desc: 'Celebration sets with free dedication, nori & chopsticks' },
  { id: 'partysets',    label: 'Party Sets',          emoji: '🎉', desc: 'Large group party packages' },
  { id: 'bulk',         label: 'Large Orders & Bulk', emoji: '📦', desc: 'Big platters — 90 pcs and above' },
];

const menu = {

  // ─────────────────────────────────────────
  // BAKED SUSHI
  // ─────────────────────────────────────────
  bakedsushi: [
    {
      id: 1, name: 'California Baked Sushi', emoji: '🫙', tag: 'bestseller',
      desc: 'Creamy California-flavor baked sushi, served with nori.',
      images: ['images/FB_IMG_1778470822375.jpg'],
      variants: [
        { size: 'Small',  price: 299, note: 'Good for 1–2 pax · 2 nori' },
        { size: 'Medium', price: 399, note: 'Good for 2–3 pax · 3 nori' },
        { size: 'Large',  price: 569, note: 'Good for 4–5 pax · 4 nori' },
      ],
    },
    {
      id: 2, name: 'Spicy Baked Sushi', emoji: '🌶️', tag: 'spicy',
      desc: 'Spicy-flavor baked sushi, served with nori.',
      images: ['images/FB_IMG_1778470822375.jpg'],
      variants: [
        { size: 'Small',  price: 319, note: 'Good for 1–2 pax · 2 nori' },
        { size: 'Medium', price: 419, note: 'Good for 2–3 pax · 3 nori' },
        { size: 'Large',  price: 599, note: 'Good for 4–5 pax · 4 nori' },
      ],
    },
    {
      id: 3, name: 'Spicy Cheese Baked Sushi', emoji: '🌶️', tag: 'spicy',
      desc: 'Baked sushi loaded with spicy cheese topping. Contact us for pricing.',
      images: ['images/FB_IMG_1778470845642.jpg'],
      price: 0,
    },
    {
      id: 4, name: '3-Flavor Baked Sushi', emoji: '🫙',
      desc: 'Three flavors in one tray, served with 6 pcs nori. Contact us for pricing.',
      images: ['images/FB_IMG_1778470845642.jpg'],
      price: 0,
    },
  ],

  // ─────────────────────────────────────────
  // MAKI ROLLS – A LA CARTE
  // ─────────────────────────────────────────
  maki: [
    { id: 5,  name: 'California Maki',                      emoji: '🌀', tag: 'bestseller', desc: 'Classic California roll.',                                         price: 159, images: ['/images/FB_IMG_1778470919270.jpg', '/images/FB_IMG_1778470926877.jpg'] },
    { id: 6,  name: 'Spicy California Maki',                emoji: '🌶️', tag: 'spicy',      desc: 'California roll with a spicy kick.',                               price: 169, images: ['/images/FB_IMG_1778470923332.jpg'] },
    { id: 7,  name: 'Veggie / Mango Maki',                  emoji: '🥭',                    desc: 'Fresh veggie or sweet mango maki roll.',                            price: 159, images: ['/images/FB_IMG_1778470885530.jpg'] },
    { id: 8,  name: 'Vegan Mango Maki',                     emoji: '🥭',                    desc: 'Plant-based mango maki roll.',                                      price: 159, images: ['/images/FB_IMG_1778470847216.jpg'] },
    { id: 9,  name: 'Kani Cheese / Veggie Mango Maki',      emoji: '🌀',                    desc: 'Kani with cheese or veggie mango combination roll (15 pcs).',       price: 259, images: [] },
    { id: 10, name: 'Veggie / Cheesey / Kani Maki',         emoji: '🌀',                    desc: 'Choice of veggie, cheesy, or kani maki roll (15 pcs).',             price: 279, images: ['/images/FB_IMG_1778470930753.jpg'] },
    { id: 11, name: 'Spicy Kani Cheese Maki',               emoji: '🌶️', tag: 'spicy',      desc: 'Kani cheese roll with spicy seasoning (10 pcs).',                   price: 179, images: ['/images/FB_IMG_1778470881802.jpg'] },
    { id: 12, name: 'Futo & California Maki',               emoji: '🌀',                    desc: 'Combo of futo and California rolls (15 pcs).',                      price: 259, images: ['/images/FB_IMG_1778470858022.jpg', '/images/FB_IMG_1778470949442.jpg'] },
    { id: 13, name: 'Cheesey / Haru / Kani Cheese Maki',    emoji: '🧀',                    desc: 'Creamy cheesy, haru, or kani cheese roll (15 pcs).',                price: 269, images: ['/images/FB_IMG_1778470934610.jpg'] },
    { id: 14, name: 'Veggie / Haru / Crazy Maki',           emoji: '🌀',                    desc: 'Your choice of veggie, haru, or crazy roll (~15 pcs).',             price: 219, images: ['/images/FB_IMG_1778470855672.jpg', '/images/FB_IMG_1778470883503.jpg'] },
    { id: 15, name: 'Overload Maki',                        emoji: '⭐', tag: 'bestseller', desc: 'Generously loaded maki roll — a crowd favorite.',                   price: 199, images: ['/images/FB_IMG_1778470925175.jpg'] },
    { id: 16, name: 'Crazy / Overload Maki',                emoji: '⭐', tag: 'bestseller', desc: 'Crazy and overload combo — best-seller pairing (15 pcs).',          price: 279, images: ['/images/FB_IMG_1778470828811.jpg', '/images/FB_IMG_1778470851595.jpg', '/images/FB_IMG_1778470853973.jpg'] },
    { id: 17, name: 'Spicy Crazy Maki Roll',                emoji: '🌶️', tag: 'spicy',      desc: 'Spicy version of our popular crazy maki. Contact us for pricing.',  price: 0,   images: ['/images/FB_IMG_1778470843422.jpg'] },
    { id: 18, name: 'Spicy Cheese Crunchy Roll',            emoji: '🌶️', tag: 'spicy',      desc: 'Crunchy roll with a spicy cheese coating.',                         price: 199, images: ['/images/FB_IMG_1778470939138.jpg'] },
    { id: 19, name: 'Spicy Cheese Crazy Maki',              emoji: '🌶️', tag: 'spicy',      desc: 'Crazy maki with spicy cheese flair. Contact us for pricing.',       price: 0,   images: ['/images/FB_IMG_1778470941764.jpg'] },
    { id: 20, name: 'Spicy Cheese / Overload Maki',         emoji: '🌶️', tag: 'spicy',      desc: 'Spicy cheese and overload combo roll.',                             price: 199, images: ['/images/FB_IMG_1778470945639.jpg'] },
    { id: 21, name: 'Overload & Kani Spicy Maki',           emoji: '🌶️', tag: 'spicy',      desc: 'Overload and spicy kani combination (15 pcs).',                     price: 269, images: ['/images/FB_IMG_1778470849326.jpg', '/images/FB_IMG_1778470947018.jpg'] },
    { id: 22, name: 'Crazy / K. Cheese / Overload Maki',    emoji: '🌀',                    desc: 'Mix of crazy, kani cheese, and overload. Contact us for pricing.',  price: 0,   images: ['/images/FB_IMG_1778470928621.jpg'] },
    { id: 23, name: 'Crunchy Maki Roll',                    emoji: '🌀',                    desc: 'Maki rolled with a crunchy coating.',                               price: 199, images: ['/images/FB_IMG_1778470951420.jpg'] },
    { id: 24, name: 'Veggie-Mango / Overload & Crazy Maki', emoji: '🌀',                    desc: 'Trio of veggie-mango, overload, and crazy rolls.',                  price: 269, images: ['/images/FB_IMG_1778470953330.jpg'] },
    { id: 25, name: 'Cheesy Maki Roll',                     emoji: '🧀',                    desc: 'Rich cheesy maki roll.',                                            price: 199, images: ['/images/FB_IMG_1778470887418.jpg'] },
  ],

  // ─────────────────────────────────────────
  // MAKI PLATTERS
  // ─────────────────────────────────────────
  platters: [
    {
      id: 26, name: 'Assorted Maki Roll Platter', emoji: '🍱', tag: 'bestseller',
      desc: 'Mixed assorted maki rolls — California, Spicy Overload, Futo, and more.',
      images: [
        'images/FB_IMG_1778470824603.jpg',
        'images/FB_IMG_1778470839119.jpg',
        'images/FB_IMG_1778470841435.jpg',
        'images/FB_IMG_1778470893190.jpg',
        'images/FB_IMG_1778470900285.jpg',
        'images/FB_IMG_1778470910581.jpg',
        'images/FB_IMG_1778470911695.jpg',
        'images/FB_IMG_1778470914103.jpg',
        'images/FB_IMG_1778470915621.jpg',
        'images/FB_IMG_1778470963523.jpg',
        'images/FB_IMG_1778470977173.jpg',
        'images/FB_IMG_1778470997521.jpg',
      ],
      variants: [
        { size: '30 pcs',        price: 499,  note: 'Good for 3–4 pax' },
        { size: '40 pcs',        price: 749,  note: 'Good for 4–5 pax' },
        { size: '42 pcs',        price: 719,  note: 'Good for 4–5 pax' },
        { size: '50 pcs',        price: 999,  note: 'Good for 5–6 pax' },
        { size: '50 pcs (Mini)', price: 700,  note: 'Good for 3–4 pax' },
        { size: '60 pcs',        price: 1149, note: 'Good for 6–7 pax' },
        { size: '70 pcs',        price: 1299, note: 'Good for 8–9 pax' },
        { size: '80 pcs',        price: 1299, note: 'Good for 8–9 pax' },
        { size: '90 pcs',        price: 1599, note: 'Good for 9–10 pax' },
      ],
    },
    {
      id: 27, name: 'Assorted Maki w/ Baked Sushi', emoji: '🍱',
      desc: 'Mixed maki rolls combined with baked sushi.',
      images: [
        'images/FB_IMG_1778470826667.jpg',
        'images/FB_IMG_1778470835552.jpg',
        'images/FB_IMG_1778470889485.jpg',
        'images/FB_IMG_1778470905235.jpg',
      ],
      variants: [
        { size: '30 pcs', price: 899,  note: 'Good for 5–6 pax' },
        { size: '80 pcs', price: 1479, note: 'Good for 8–9 pax' },
      ],
    },
    { id: 28, name: 'Assorted – Cali / Spicy Overload / Futo (30 pcs)', emoji: '🍱',                    desc: 'Three-flavor combo platter. Good for 3–4 pax.',                              price: 559,  images: ['images/FB_IMG_1778470837513.jpg', 'images/FB_IMG_1778470891325.jpg', 'images/FB_IMG_1778470896119.jpg', 'images/FB_IMG_1778470898326.jpg', 'images/FB_IMG_1778470901816.jpg'] },
    { id: 29, name: 'Assorted – Overload / Crazy / California (30 pcs)', emoji: '⭐', tag: 'bestseller', desc: 'Best-seller trio platter.',                                                   price: 539,  images: ['images/FB_IMG_1778470820675.jpg', 'images/FB_IMG_1778470903569.jpg'] },
    { id: 30, name: 'Assorted – Cali / Futo / Veggies (50 pcs)',         emoji: '🍱',                    desc: 'Light trio of California, Futo, and veggie rolls. Good for 5–6 pax.',       price: 999,  images: ['images/FB_IMG_1778470907064.jpg'] },
    { id: 31, name: 'Assorted – Futo / Maru / Veggies (42 pcs)',         emoji: '🍱',                    desc: 'Hearty combo of futo, maru, and veggie maki. Good for 4–5 pax. Contact us.', price: 0,   images: [] },
    { id: 32, name: '30 pcs Maki Roll – All Baked (Regular)',             emoji: '🫙',                    desc: 'Full tray of baked maki rolls in regular flavor. Good for 7–8 pax.',        price: 1349, images: [] },
  ],

  // ─────────────────────────────────────────
  // KANI SALAD
  // ─────────────────────────────────────────
  kanisalad: [
    {
      id: 33, name: 'Kani Salad Platter', emoji: '🥗', tag: 'bestseller',
      desc: 'Fresh and creamy kani salad.',
      images: [
        'images/FB_IMG_1778470833363.jpg',
        'images/FB_IMG_1778470943705.jpg',
        'images/FB_IMG_1778470955499.jpg',
      ],
      variants: [
        { size: 'Small',  price: 419, note: 'Good for 4–5 pax' },
        { size: 'Medium', price: 499, note: 'Good for 6–7 pax' },
        { size: 'Large',  price: 0,   note: 'Good for 7–8 pax · Contact us' },
        { size: 'XL',     price: 799, note: 'Good for 8–9 pax' },
      ],
    },
    { id: 34, name: 'Kani / Overload / Haru Maki (32 pcs)', emoji: '🥗', desc: 'Kani, overload, and haru roll combo.',                     price: 569, images: [] },
    { id: 35, name: '30 pcs Maki w/ Kani Salad',            emoji: '🍱', desc: 'Assorted maki rolls served with kani salad on the side.', price: 699, images: ['images/FB_IMG_1778470894814.jpg'] },
    { id: 36, name: '50 pcs Maki w/ Kani Salad',            emoji: '🍱', desc: 'Larger maki set paired with kani salad.',                 price: 699, images: [] },
  ],

  // ─────────────────────────────────────────
  // HARU MAKI SALAD
  // ─────────────────────────────────────────
  haru: [
    {
      id: 37, name: 'Haru Maki Salad', emoji: '🌿',
      desc: 'Light and fresh haru maki salad rolls.',
      images: [
        'images/FB_IMG_1778470831492.jpg',
        'images/FB_IMG_1778470957337.jpg',
        'images/FB_IMG_1778470959436.jpg',
      ],
      variants: [
        { size: '30 pcs', price: 459, note: 'Good for 2–3 pax' },
        { size: '36 pcs', price: 549, note: 'Good for 3–5 pax' },
        { size: '42 pcs', price: 629, note: 'Good for 4–5 pax' },
        { size: '48 pcs', price: 699, note: 'Good for 6–7 pax' },
        { size: '60 pcs', price: 889, note: 'Good for 8–9 pax' },
      ],
    },
    {
      id: 38, name: 'Assorted Maki w/ Haru Salad', emoji: '🍱',
      desc: 'Combination of assorted maki and haru maki salad rolls.',
      images: [
        'images/FB_IMG_1778470921628.jpg',
        'images/FB_IMG_1778471031375.jpg',
      ],
      variants: [
        { size: '42 pcs', price: 759,  note: 'Good for 4–5 pax' },
        { size: '54 pcs', price: 889,  note: 'Good for 5–6 pax' },
        { size: '60 pcs', price: 1149, note: 'Good for 6–7 pax' },
      ],
    },
    { id: 39, name: 'Veggie / California / Haru Maki (42–45 pcs)', emoji: '🌿', desc: 'Light trio of veggie, California, and haru rolls. Good for 4–5 pax.', price: 649,  images: [] },
    { id: 40, name: 'California & Haru Maki (54 pcs)',              emoji: '🌿', desc: 'California and haru maki combo platter. Good for 5–6 pax.',           price: 889,  images: [] },
    { id: 41, name: 'Maki w/ Haro Salad (60 pcs)',                  emoji: '🍱', desc: 'Assorted maki rolls paired with haro salad.',                         price: 1447, images: [] },
  ],

  // ─────────────────────────────────────────
  // BIRTHDAY SETS
  // ─────────────────────────────────────────
  birthdaysets: [
    { id: 42, name: 'Birthday Set A',           emoji: '🎂', tag: 'bestseller', desc: '30 pcs assorted maki + small baked sushi. Includes dedication card, nori & chopsticks. Good for 7–8 pax.',                                          price: 1349, images: ['images/FB_IMG_1778471035880.jpg'] },
    { id: 43, name: 'Birthday Set B',           emoji: '🎂',                    desc: 'Assorted maki + large baked sushi + haru maki salad (48 pcs). Includes dedication, nori & chopsticks. Good for 16–18 pax. Contact us for pricing.', price: 0,    images: [] },
    { id: 44, name: 'Birthday Set (15–16 pax)', emoji: '🎂',                    desc: '80 pcs assorted maki + 60 pcs haru maki salad + baked sushi. Includes dedication, nori & free chopsticks. Contact us for pricing.',                price: 0,    images: [] },
    { id: 45, name: 'Birthday Set (17–19 pax)', emoji: '🎂',                    desc: 'Assorted maki, baked sushi & kani salad. Includes dedication & chopsticks. Contact us for pricing.',                                               price: 0,    images: ['images/FB_IMG_1778471033589.jpg'] },
    { id: 46, name: 'Birthday Set (18–20 pax)', emoji: '🎂',                    desc: 'Assorted maki + 3-flavor baked sushi + kani salad. Includes dedication & chopsticks.',                                                            price: 3099, images: ['images/FB_IMG_1778471037585.jpg', 'images/FB_IMG_1778471058540.jpg'] },
    { id: 47, name: 'Birthday Set (24–25 pax)', emoji: '🎂',                    desc: '90 pcs assorted maki + 48 pcs haru maki salad. Includes dedication, nori & chopsticks. Contact us for pricing.',                                  price: 0,    images: [] },
  ],

  // ─────────────────────────────────────────
  // PARTY SETS
  // ─────────────────────────────────────────
  partysets: [
    { id: 48, name: 'Party Set (28–30 pax)',            emoji: '🎉', tag: 'bestseller', desc: '48 pcs haro maki salad + 70 pcs assorted maki + 2 big baked sushi w/ spicy + kani salad. Free mini haru schiiro.',                       price: 4099, images: ['images/FB_IMG_1778471044176.jpg', 'images/FB_IMG_1778471046379.jpg', 'images/FB_IMG_1778471059522.jpg'] },
    { id: 49, name: 'Birthday Set Platter (20–22 pax)', emoji: '🎉',                    desc: '90 pcs assorted maki + baked sushi + kani salad + haru maki salad + 70 pc dedication platter. Free nori, chopsticks & dedication card.', price: 2799, images: ['images/FB_IMG_1778471040426.jpg'] },
    { id: 50, name: 'Party Set Platter (15–17 pax)',    emoji: '🎉',                    desc: 'Baked sushi (overload maki – best seller), 4 pcs nori & free chopsticks. 30 pcs mini party platter included. Contact us for pricing.',   price: 0,    images: [] },
    { id: 51, name: 'Party Set (36–38 pax)',            emoji: '🎉',                    desc: 'Assorted maki and haru maki salad. Includes mini kani salad (small). Contact us for pricing.',                                           price: 0,    images: [] },
    { id: 52, name: 'Party Set (50–52 pax)',            emoji: '🎉',                    desc: '90 pcs maki + 48 pcs haru maki salad + kani salad. Free nori and chopsticks. Contact us for pricing.',                                   price: 0,    images: [] },
  ],

  // ─────────────────────────────────────────
  // LARGE ORDERS & BULK
  // ─────────────────────────────────────────
  bulk: [
    {
      id: 53, name: '90 pcs Assorted Maki Roll', emoji: '📦', tag: 'bestseller',
      desc: 'Massive maki platter for big gatherings.',
      images: [
        'images/FB_IMG_1778470908507.jpg',
        'images/FB_IMG_1778470917601.jpg',
      ],
      variants: [
        { size: 'Standard', price: 1599, note: 'Good for 9–10 pax' },
        { size: 'w/ Spicy', price: 1959, note: 'Good for 10–12 pax' },
      ],
    },
  ],

};
