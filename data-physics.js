// Comparable physical parameters from NASA planetary fact sheets.
const PHYSICS_DATA={
  Mercury:['Mass','3.30 × 10²³ kg','Mean density','5.43 g/cm³','Surface gravity','3.7 m/s²','Escape velocity','4.3 km/s','Orbital speed','47.4 km/s'],
  Venus:['Mass','4.87 × 10²⁴ kg','Mean density','5.24 g/cm³','Surface gravity','8.9 m/s²','Escape velocity','10.4 km/s','Orbital speed','35.0 km/s'],
  Earth:['Mass','5.97 × 10²⁴ kg','Mean density','5.51 g/cm³','Surface gravity','9.8 m/s²','Escape velocity','11.2 km/s','Orbital speed','29.8 km/s'],
  Mars:['Mass','6.42 × 10²³ kg','Mean density','3.93 g/cm³','Surface gravity','3.7 m/s²','Escape velocity','5.0 km/s','Orbital speed','24.1 km/s'],
  Jupiter:['Mass','1.898 × 10²⁷ kg','Mean density','1.33 g/cm³','Gravity at 1 bar','23.1 m/s²','Escape velocity','59.5 km/s','Orbital speed','13.1 km/s'],
  Saturn:['Mass','5.68 × 10²⁶ kg','Mean density','0.69 g/cm³','Gravity at 1 bar','9.0 m/s²','Escape velocity','35.5 km/s','Orbital speed','9.7 km/s'],
  Uranus:['Mass','8.68 × 10²⁵ kg','Mean density','1.27 g/cm³','Gravity at 1 bar','8.7 m/s²','Escape velocity','21.3 km/s','Orbital speed','6.8 km/s'],
  Neptune:['Mass','1.02 × 10²⁶ kg','Mean density','1.64 g/cm³','Gravity at 1 bar','11.0 m/s²','Escape velocity','23.5 km/s','Orbital speed','5.4 km/s'],
  Moon:['Mass','7.35 × 10²² kg','Mean density','3.34 g/cm³','Surface gravity','1.62 m/s²','Escape velocity','2.38 km/s','Orbital speed','1.02 km/s around Earth'],
  Pluto:['Mass','1.30 × 10²² kg','Mean density','1.85 g/cm³','Surface gravity','0.7 m/s²','Escape velocity','1.3 km/s','Orbital speed','4.7 km/s']
};

for(const item of window.GUIDE_DATA)item.physics=PHYSICS_DATA[item.name]||[];