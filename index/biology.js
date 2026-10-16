export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const BASE_COLORS={A:'#e4b759',T:'#87a9de',G:'#7bc49d',C:'#e2a0a9',U:'#bc9ad9'};
export const BASE_INK={A:'#986718',T:'#4268a0',G:'#32794e',C:'#a84e60',U:'#79519a'};
export const GENETIC_CODE={
  UUU:'Phe',UUC:'Phe',UUA:'Leu',UUG:'Leu',UCU:'Ser',UCC:'Ser',UCA:'Ser',UCG:'Ser',UAU:'Tyr',UAC:'Tyr',UAA:'Stop',UAG:'Stop',UGU:'Cys',UGC:'Cys',UGA:'Stop',UGG:'Trp',
  CUU:'Leu',CUC:'Leu',CUA:'Leu',CUG:'Leu',CCU:'Pro',CCC:'Pro',CCA:'Pro',CCG:'Pro',CAU:'His',CAC:'His',CAA:'Gln',CAG:'Gln',CGU:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
  AUU:'Ile',AUC:'Ile',AUA:'Ile',AUG:'Met',ACU:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',AAU:'Asn',AAC:'Asn',AAA:'Lys',AAG:'Lys',AGU:'Ser',AGC:'Ser',AGA:'Arg',AGG:'Arg',
  GUU:'Val',GUC:'Val',GUA:'Val',GUG:'Val',GCU:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',GAU:'Asp',GAC:'Asp',GAA:'Glu',GAG:'Glu',GGU:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly'
};
export const AMINO_NAMES={Met:'Metionin',Ala:'Alanin',Phe:'Fenilalanin',Glu:'Glutamat',Trp:'Triptofan',Leu:'Leusin',Ser:'Serin',Tyr:'Tirosin',Cys:'Sistein',Pro:'Prolin',His:'Histidin',Gln:'Glutamin',Arg:'Arginin',Ile:'Isoleusin',Thr:'Treonin',Asn:'Asparagin',Lys:'Lisin',Val:'Valin',Asp:'Aspartat',Gly:'Glisin',Stop:'Sinyal stop'};
export const VARIANTS={
  original:{label:'Urutan awal',dna:'ATGGCTTTTGAATGGTAA',title:'Urutan acuan',description:'Lima asam amino terbentuk sebelum kodon UAA menghentikan translasi.',changed:-1},
  silent:{label:'Sinonim',dna:'ATGGCCTTTGAATGGTAA',title:'Basa berubah, asam amino tetap',description:'GCT → GCC pada DNA menghasilkan GCU → GCC pada mRNA. Keduanya mengode alanin.',changed:1},
  missense:{label:'Missense',dna:'ATGGTTTTTGAATGGTAA',title:'Satu asam amino berubah',description:'GCT → GTT menghasilkan GCU → GUU. Alanin digantikan valin pada posisi kedua.',changed:1},
  nonsense:{label:'Nonsense',dna:'ATGGCTTTTGAATGATAA',title:'Stop muncul lebih awal',description:'TGG → TGA menghasilkan UGG → UGA. Translasi berhenti sebelum triptofan ditambahkan.',changed:4}
};
export function complementDNA(dna){if(!/^[ATGC]+$/.test(dna))throw Error('DNA hanya menggunakan A, T, G, dan C.');return [...dna].map(x=>({A:'T',T:'A',G:'C',C:'G'}[x])).join('');}
export function transcribe(template){if(!/^[ATGC]+$/.test(template))throw Error('Cetakan DNA tidak valid.');return [...template].map(x=>({A:'U',T:'A',G:'C',C:'G'}[x])).join('');}
export function anticodon(codon){return [...codon].map(x=>({A:'U',U:'A',G:'C',C:'G'}[x])).join('');}
export const codonsOf=seq=>seq.match(/.{1,3}/g)||[];
export function translate(rna){const codons=codonsOf(rna),chain=[];for(const c of codons){const aa=GENETIC_CODE[c];if(!aa)throw Error('Kodon tidak lengkap atau tidak valid.');if(aa==='Stop')break;chain.push(aa);}return chain;}
export function modelFor(variant='original'){
  const v=VARIANTS[variant]??VARIANTS.original,coding=v.dna,template=complementDNA(coding),rna=transcribe(template),codons=codonsOf(rna),chain=translate(rna);
  return {...v,variant,coding,template,rna,codons,chain,translation:translationSteps(codons)};
}
export function translationSteps(codons){
  const steps=[{phase:'scan',codon:0,completed:0},{phase:'init',codon:0,completed:1}];
  for(let i=1;i<codons.length;i++){
    if(GENETIC_CODE[codons[i]]==='Stop'){steps.push({phase:'stop',codon:i,completed:i},{phase:'release',codon:i,completed:i});break;}
    steps.push({phase:'entry',codon:i,completed:i},{phase:'bond',codon:i,completed:i+1},{phase:'move',codon:i,completed:i+1});
  }
  return steps;
}
export const STAGES=[{name:'Eksplorasi DNA',short:'DNA',location:'Nukleus',tag:'KENALI STRUKTURNYA'},{name:'Transkripsi',short:'Transkripsi',location:'Nukleus',tag:'DNA → RNA'},{name:'Pemrosesan RNA',short:'Pemrosesan',location:'Nukleus → sitoplasma',tag:'SIAPKAN PESANNYA'},{name:'Translasi',short:'Translasi',location:'Sitoplasma',tag:'mRNA → POLIPEPTIDA'}];
export const maxStep=(stage,model)=>[3,21,5,model.translation.length-1][stage];
export function stepInfo(stage,value,model){
  const n=clamp(Math.floor(value),0,maxStep(stage,model));
  if(stage===0){return [
    {title:'Informasi dimulai dari DNA.',phase:'Struktur heliks ganda',action:'Putar model dan klik basa untuk mengenali komponennya.',formed:'Dua untai DNA berpasangan membentuk heliks ganda.',why:'Urutan basa menyimpan informasi genetik.',detail:'Gula deoksiribosa dan fosfat membentuk tulang punggung. Basa mengarah ke bagian dalam heliks.'},
    {title:'Pasangan basa punya aturan.',phase:'Komplementaritas',action:'Amati A berpasangan dengan T, sedangkan G dengan C.',formed:'Pasangan basa menghubungkan kedua untai DNA.',why:'Komplementaritas memungkinkan informasi disalin dengan urutan yang sesuai.',detail:'A–T memiliki dua ikatan hidrogen dan G–C tiga. Sambungan pada model merupakan simbol, bukan ukuran ikatan sebenarnya.'},
    {title:'Dua untai, arah berlawanan.',phase:'Antiparalel',action:'Bandingkan penanda 5′ dan 3′ pada kedua ujung.',formed:'Untai 5′ → 3′ berdampingan dengan untai 3′ → 5′.',why:'Arah untai menentukan cara RNA polimerase membaca DNA.',detail:'Untai cetakan dibaca 3′ → 5′; RNA baru dibuat 5′ → 3′. Untai pengode memiliki urutan yang sama dengan bagian RNA terkait, dengan T diganti U.'},
    {title:'Dari triplet menuju kodon.',phase:'Siapkan pembacaan',action:'Klik kelompok tiga basa pada panel urutan di bawah model.',formed:'Kodon adalah kelompok tiga basa yang dibaca pada mRNA saat translasi.',why:'Kerangka baca menentukan pengelompokan basa menjadi kodon.',detail:'Model utama memperlihatkan fragmen daerah pengode (CDS), bukan gen lengkap. Promoter dan UTR berada di luar fragmen yang ditampilkan.'}
  ][n];}
  if(stage===1){
    if(n===0)return {title:'Mulai dari promoter.',phase:'Inisiasi',action:'Faktor transkripsi membantu merekrut RNA polimerase II pada promoter.',formed:'Kompleks inisiasi transkripsi terbentuk.',why:'Promoter membantu menentukan tempat dan arah awal transkripsi.',detail:'Penanda promoter di kiri bersifat skematis. Awal transkripsi berbeda dari kodon AUG yang memulai translasi.'};
    if(n===1)return {title:'Buka DNA secara lokal.',phase:'Inisiasi',action:'Sebagian kecil heliks terbuka di sekitar RNA polimerase.',formed:'Gelembung transkripsi memperlihatkan untai cetakan.',why:'Basa cetakan harus dapat diakses sebelum RNA disintesis.',detail:'DNA di luar gelembung tetap berpasangan. Ini transkripsi, bukan replikasi seluruh DNA.'};
    if(n>=2&&n<=19){const i=n-2,base=model.template[i],r=model.rna[i];return {title:`Tambahkan ${r} pada RNA.`,phase:`Elongasi · basa ${i+1}/18`,action:`RNA polimerase membaca ${base} pada cetakan dan memasangkan nukleotida ${r}.`,formed:`Fragmen RNA kini memiliki ${i+1} nukleotida.`,why:'RNA tumbuh dengan penambahan nukleotida pada ujung 3′.',detail:'Cetakan dibaca 3′ → 5′, sementara RNA tumbuh 5′ → 3′. DNA di belakang polimerase kembali berpasangan.'};}
    return n===20?{title:'Daerah pengode selesai disalin.',phase:'Pemrosesan ujung & terminasi',action:'Polimerase melanjutkan transkripsi melewati daerah pengode; ujung RNA diproses.',formed:'Pre-mRNA yang akan dimatangkan.',why:'Kodon stop bukan sinyal untuk menghentikan RNA polimerase.',detail:'Untuk RNA polimerase II, pemotongan RNA terkait pemrosesan ujung 3′ dan diikuti terminasi di hilir. Wilayah tersebut ditampilkan secara skematis.'}:{title:'RNA siap diproses.',phase:'Transisi ke pemrosesan',action:'Transkrip terlepas dan DNA kembali berpasangan.',formed:'RNA telah membawa salinan informasi dari DNA.',why:'RNA harus diproses sebelum digunakan dalam translasi pada contoh sel eukariotik ini.',detail:'Yang terlihat di panel urutan adalah fragmen daerah pengode saja. UTR, tudung 5′, dan ekor poli-A tidak diterjemahkan menjadi asam amino.'};
  }
  if(stage===2)return [
    {title:'RNA belum selesai disiapkan.',phase:'Contoh pemrosesan RNA',action:'Amati contoh RNA dengan dua ekson dan satu intron ilustratif.',formed:'Pre-mRNA menjadi bahan untuk pemrosesan.',why:'Bagian yang dipertahankan harus tersambung dalam urutan yang benar.',detail:'Ini contoh splicing terpisah: intron skematis ditambahkan setelah basa ke-6. DNA utama hanya fragmen CDS tanpa intron.'},
    {title:'Pasang pelindung di ujung 5′.',phase:'Penambahan tudung 5′',action:'Tudung 5′ ditambahkan pada ujung RNA.',formed:'RNA bertudung 5′.',why:'Tudung membantu perlindungan RNA dan pengenalan saat inisiasi translasi.',detail:'Tudung berupa guanosin termodifikasi. Capping dapat dimulai ketika transkripsi masih berlangsung.'},
    {title:'Buang intron, sambungkan ekson.',phase:'Splicing',action:'Intron dipotong dan ekson disambungkan.',formed:'Urutan daerah pengode kembali menjadi 18 basa contoh.',why:'Intron ilustratif tidak ikut menjadi kodon pada mRNA matang.',detail:'Splicing dibantu spliceosome. Model menyederhanakan bentuk dan tahap kimianya; bukan hanya menghapus basa secara acak.'},
    {title:'Tambahkan ekor poli-A.',phase:'Pemrosesan ujung 3′',action:'Ujung 3′ dipotong dan poli-A polimerase menambahkan deretan A.',formed:'mRNA matang dengan tudung 5′ dan ekor poli-A.',why:'Ekor poli-A membantu stabilitas dan penggunaan mRNA.',detail:'Ekor poli-A ditambahkan tanpa cetakan DNA dan bukan bagian dari daerah pengode. Sebagian besar mRNA eukariotik memiliki ekor poli-A.'},
    {title:'Kirim pesan keluar nukleus.',phase:'Ekspor mRNA',action:'mRNA matang bergerak melalui pori inti menuju sitoplasma.',formed:'mRNA berada di lokasi yang dapat diakses ribosom sitoplasmik.',why:'Pada model eukariotik ini, transkripsi dan translasi dipisahkan oleh membran inti.',detail:'Buka “Lokasi dalam sel” untuk melihat hubungan ruang antara DNA di nukleus dan ribosom di sitoplasma.'},
    {title:'Pesan siap diterjemahkan.',phase:'mRNA matang',action:'mRNA siap berinteraksi dengan mesin translasi di sitoplasma.',formed:'Daerah pengode tetap sama setelah pemrosesan yang tepat.',why:'Ribosom membaca kodon, bukan seluruh tudung, UTR, atau ekor poli-A.',detail:'Tahapan dipisahkan untuk pembelajaran. Pada sel nyata, beberapa proses pematangan RNA berlangsung bersamaan dengan transkripsi.'}
  ][n];
  const t=model.translation[n],codon=model.codons[t.codon],aa=AMINO_NAMES[GENETIC_CODE[codon]],anti=GENETIC_CODE[codon]==='Stop'?null:anticodon(codon);
  const map={
    scan:{title:'Temukan kodon awal.',phase:'Inisiasi · pemindaian',action:'Kompleks subunit kecil, faktor inisiasi, dan tRNA inisiator mencari AUG.',formed:'Kompleks inisiasi pada mRNA.',why:'AUG pada contoh menetapkan awal kerangka baca.',detail:'Pemindaian daerah 5′ UTR disederhanakan. Subunit besar bergabung setelah pengenalan kodon awal yang sesuai.'},
    init:{title:'Mulai dengan metionin.',phase:'Inisiasi · situs P',action:'tRNA inisiator memasangkan antikodon 3′–UAC–5′ dengan AUG pada situs P.',formed:'Rantai dimulai dengan metionin.',why:'tRNA inisiator menempati situs P, bukan masuk melalui situs A.',detail:'Ribosom lengkap memiliki situs A (aminoasil), P (peptidil), dan E (keluar).'},
    entry:{title:`Datangkan ${aa.toLowerCase()}.`,phase:`Elongasi · kodon ${t.codon+1}`,action:`tRNA dengan antikodon 3′–${anti}–5′ masuk ke situs A dan mengenali 5′–${codon}–3′.`,formed:'Pasangan kodon–antikodon yang komplementer dan antiparalel.',why:'Kecocokan kodon membantu penambahan asam amino yang sesuai.',detail:'tRNA telah diisi asam amino oleh aminoasil-tRNA sintetase sebelum memasuki ribosom. Pengisian disederhanakan dalam model.'},
    bond:{title:'Sambungkan ikatan peptida.',phase:'Elongasi · ikatan peptida',action:'Rantai dari tRNA di situs P dipindahkan ke asam amino pada tRNA situs A.',formed:`Rantai kini memiliki ${t.completed} asam amino.`,why:'Ikatan peptida menghubungkan asam amino menjadi polipeptida.',detail:'Pusat peptidil transferase pada subunit besar mengatalisis reaksi. Rantai tumbuh dari ujung N menuju ujung C.'},
    move:{title:'Geser satu kodon.',phase:'Elongasi · translokasi',action:'Ribosom bergerak tiga basa ke arah ujung 3′; tRNA bergeser A → P dan P → E.',formed:'Situs A kosong untuk kodon berikutnya; tRNA kosong keluar dari situs E.',why:'Translokasi mempertahankan kerangka baca tiga basa.',detail:'Gerakan relatif ribosom terhadap mRNA diperlihatkan secara skematis. Hanya tRNA yang masih terkait dengan tahap aktif ditampilkan.'},
    stop:{title:`${codon}: waktunya berhenti.`,phase:'Terminasi · faktor pelepas',action:'Faktor pelepas mengenali kodon stop pada situs A.',formed:'Kompleks terminasi translasi.',why:'Kodon stop tidak mengode asam amino dan tidak memiliki tRNA pembawa “stop”.',detail:'Tiga kodon stop pada kode genetik standar adalah UAA, UAG, dan UGA.'},
    release:{title:'Polipeptida dilepaskan.',phase:'Terminasi · pelepasan',action:'Rantai polipeptida lepas dari tRNA dan komponen ribosom didaur ulang.',formed:`Rantai ${model.chain.length} asam amino: ${model.chain.join(' – ')}.`,why:'Hasil translasi selanjutnya dapat mengalami pelipatan dan pemrosesan.',detail:'Rantai pendek ini merupakan contoh edukatif, bukan protein fungsional lengkap. Stop tidak dihitung sebagai asam amino.'}
  };return map[t.phase];
}
