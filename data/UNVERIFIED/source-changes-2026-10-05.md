# Source changes — 2026-10-05

Official sources changed (or could not be checked). A human must review
each item, update the affected data, and bump `verified_at`.

Watched 476 sources: 0 changed, 398 first snapshots, 0 volatile (differ between fetches, not flagged), 78 newly unmonitorable, 0 still unmonitorable (unreachable, JS-rendered or bot-challenged).

## Newly unreachable (URL moved? blocked?)

- **eu-ees-hub** — fetch failed (no readable content (75 chars: JS-rendered page or bot challenge)): https://travel-europe.europa.eu/ees_en — used by /ees pages (verify URL is still canonical)
- **eu-etias-hub** — fetch failed (no readable content (75 chars: JS-rendered page or bot challenge)): https://travel-europe.europa.eu/etias_en — used by data/etias.json, /etias/status (verify URL is still canonical)
- **ma-visa-exemption-list** — fetch failed (no readable content (118 chars: JS-rendered page or bot challenge)): https://www.consulat.ma/en/list-countries-whose-citizens-are-exempted-entry-visa-morocco — used by data/entry-requirements.json (Morocco visa-exemption list)
- **id-imigrasi-voa-bvk-list** — fetch failed (HTTP 403): https://www.imigrasi.go.id/wna/daftar-negara-voa-bvk-calling-visa — used by data/entry-requirements.json (Indonesia VOA/visa-free/Calling Visa nationality lists — Brazil moved from VOA to visa-free 2026-07-09, worth periodic recheck)
- **sa-evisa-portal** — fetch failed (HTTP 403): https://visa.visitsaudi.com/ — used by data/entry-requirements.json (Saudi Arabia eVisa eligible-nationality list)
- **eu-visa-list-regulation-annex1** — fetch failed (no readable content (0 chars: JS-rendered page or bot challenge)): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230 — used by data/nationality-rules.json (Regulation (EU) 2018/1806 Annex I — third countries whose nationals need a Schengen visa; used for China/India's schengenVisaRequired status)
- **kr-keta-portal** — fetch failed (no readable content (15 chars: JS-rendered page or bot challenge)): https://www.k-eta.go.kr/ — used by data/entry-requirements.json (South Korea K-ETA eligible-nationality list, fee, temporary exemption window through 2026-12-31)
- **data-f3696f0f8c** — fetch failed (no readable content (67 chars: JS-rendered page or bot challenge)): https://help.cbp.gov/s/article/Article-1444 — used by customs-items.json:prescription-medication-us
- **data-f2da113fc5** — fetch failed (no readable content (67 chars: JS-rendered page or bot challenge)): https://help.cbp.gov/s/article/Article-1123 — used by customs-items.json:weapons-us
- **data-aa681251c4** — fetch failed (no readable content (0 chars: JS-rendered page or bot challenge)): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32007L0074 — used by customs-items.json:alcohol-eu, customs-items.json:tobacco-eu, customs-items.json:e-cigarettes-eu (+1 more)
- **data-7fcbfb5e17** — fetch failed (no readable content (0 chars: JS-rendered page or bot challenge)): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A42000A0922(02) — used by customs-items.json:prescription-medication-eu, customs-items.json:controlled-medication-eu
- **data-59cc866d45** — fetch failed (no readable content (0 chars: JS-rendered page or bot challenge)): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019R2122 — used by customs-items.json:meat-dairy-eu
- **data-c18abc457b** — fetch failed (no readable content (0 chars: JS-rendered page or bot challenge)): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32018R1672 — used by customs-items.json:cash-eu
- **data-56199bb4eb** — fetch failed (no readable content (0 chars: JS-rendered page or bot challenge)): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021L0555 — used by customs-items.json:weapons-eu
- **data-9795647c7e** — fetch failed (HTTP 403): https://customs.gov.ng/?page_id=3073 — used by customs-items.json:alcohol-ng, customs-items.json:tobacco-ng
- **data-7ab75ae2c1** — fetch failed (HTTP 403): https://customs.gov.ng/?page_id=3077 — used by customs-items.json:weapons-ng
- **data-15026dd475** — fetch failed (fetch failed): https://fr.diplomatie.ma/visiter-le-maroc-facilit%C3%A9s-douani%C3%A8res-accord%C3%A9es-aux-personnes-ayant-leur-r%C3%A9sidence-%C3%A0-l%C3%A9tranger-et-s%C3%A9journant-temporairement — used by customs-items.json:alcohol-ma, customs-items.json:tobacco-ma, customs-items.json:medication-ma (+1 more)
- **data-ec0e648453** — fetch failed (HTTP 404): https://rwandafda.gov.rw/wp-content/uploads/2023/03/Guidelines%20for%20import%20and%20export%20of%20regulated%20products%20declared%20as%20personal%20effects.pdf — used by customs-items.json:prescription-medication-rw, customs-items.json:controlled-substances-rw, customs-items.json:injectable-medication-rw
- **data-8672255658** — fetch failed (fetch failed): https://gumrukrehberi.gov.tr/sayfa/yolcu-beraberinde-getirilen-t%C3%BCketim-e%C5%9Fyas%C4%B1n%C4%B1n-miktarlar%C4%B1-ne-kadard%C4%B1r — used by customs-items.json:alcohol-tr, customs-items.json:tobacco-tr
- **data-1678c2789a** — fetch failed (fetch failed): https://gumrukrehberi.gov.tr/kategori/bireysel-slemler/nakit-ve-ziynet-esyasi-rehberi — used by customs-items.json:cash-tr
- **data-b369587498** — fetch failed (fetch failed): https://gumrukrehberi.gov.tr/sayfa/yolcunun-kulland%C4%B1%C4%9F%C4%B1-ila%C3%A7lar%C4%B1n%C4%B1-beraberinde-t%C3%BCrkiyeye-getirmesi-m%C3%BCmk%C3%BCn-m%C3%BCd%C3%BCr — used by customs-items.json:medication-tr
- **data-68cd12efe8** — fetch failed (fetch failed): https://gumrukrehberi.gov.tr/sayfa/yolcu-beraberinde-t%C3%BCrkiyeye-getirilebilen-di%C4%9Fer-g%C4%B1da-%C3%BCr%C3%BCnleri-nelerdir — used by customs-items.json:meat-dairy-tr, customs-items.json:plant-products-tr
- **data-ded741e134** — fetch failed (fetch failed): https://gumrukrehberi.gov.tr/sayfa/posta-ya-da-h%C4%B1zl%C4%B1-kargo-ta%C5%9F%C4%B1mac%C4%B1l%C4%B1%C4%9F%C4%B1-yoluyla-t%C3%BCrkiyeye-getirilemeyecek-e%C5%9Fyalar-hangileridir — used by customs-items.json:cannabis-tr
- **data-8de4b2a2d4** — fetch failed (fetch failed): https://www.abf.gov.au/entering-and-leaving-australia/duty-free — used by customs-items.json:alcohol-au, customs-items.json:tobacco-au
- **data-0467ff9207** — fetch failed (fetch failed): https://www.austrac.gov.au/general-public/moving-money-overseas — used by customs-items.json:cash-au
- **data-42d4904dc3** — fetch failed (HTTP 404): https://u.ae/en/information-and-services/health-and-fitness/drugs-and-controlled-medicines — used by customs-items.json:medication-ae
- **data-fc042ba81c** — fetch failed (no readable content (17 chars: JS-rendered page or bot challenge)): https://www.customs.gov.vn/index.jsp?pageId=2281&aid=157208&cid=4208 — used by customs-items.json:alcohol-vn, customs-items.json:tobacco-vn
- **data-b0d533ff36** — fetch failed (no readable content (17 chars: JS-rendered page or bot challenge)): https://www.customs.gov.vn/index.jsp?pageId=2281&aid=157007&cid=4208 — used by customs-items.json:cash-vn
- **data-e55b93df86** — fetch failed (fetch failed): https://english.cq.gov.cn/services/entryandexit/FAQs/202606/t20260629_15782361.html — used by customs-items.json:alcohol-cn, customs-items.json:tobacco-cn
- **data-68e9c2d05c** — fetch failed (The operation was aborted due to timeout): https://www.indiacode.nic.in/bitstream/123456789/13078/1/A2019-42.pdf — used by customs-items.json:e-cigarettes-in
- **data-dad093d155** — fetch failed (HTTP 404): https://www.fas.usda.gov/data/china-cannabidiol-be-regulated-precursor-chemical — used by customs-items.json:cbd-cn
- **data-64f820f800** — fetch failed (HTTP 404): https://www.gov.br/anac/pt-br/assuntos/drones/cadastro-de-drone — used by customs-items.json:drones-br
- **data-6bb5511fcf** — fetch failed (fetch failed): https://peraturan.go.id/id/permenhub-no-pm37-tahun-2020 — used by customs-items.json:drones-id
- **data-c62a85d1c0** — fetch failed (fetch failed): https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/95621 — used by customs-items.json:e-cigarettes-ph
- **data-cf1a4df659** — fetch failed (HTTP 412): http://www.customs.gov.cn/customs/302249/302266/302267/4666399/index.html — used by customs-items.json:e-cigarettes-cn
- **data-4b13c79269** — fetch failed (no readable content (17 chars: JS-rendered page or bot challenge)): https://kv17.customs.gov.vn/index.jsp?pageId=2&aid=1637&cid=43 — used by customs-items.json:controlled-medication-vn
- **data-2be110c151** — fetch failed (HTTP 403): https://www.gov.ie/en/department-of-agriculture-food-and-the-marine/publications/information-on-personal-consignments-in-luggage-or-through-postal-courier-online-services/ — used by customs-items.json:fresh-produce-ie
- **data-4bbc0c53b5** — fetch failed (HTTP 403): https://www.gov.ie/en/department-of-justice-home-affairs-and-migration/publications/firearms-your-questions-answered/ — used by customs-items.json:weapons-ie
- **data-3597b98221** — fetch failed (HTTP 403): https://www.citizensinformation.ie/en/travel-and-recreation/travel-to-ireland/customs-regulations-for-travellers/ — used by customs-items.json:cannabis-ie
- **data-8347fef8cf** — fetch failed (HTTP 403): https://www.gov.ie/en/department-of-health/services/travelling-into-ireland-from-schengen-countries-with-prescribed-narcotics-andor-psychotropic-substances/ — used by customs-items.json:prescription-medication-ie, customs-items.json:controlled-medication-ie
- **data-040a782a80** — fetch failed (HTTP 403): https://www.citizensinformation.ie/en/travel-and-recreation/sport-and-leisure/owning-and-operating-a-drone/ — used by customs-items.json:drones-ie
- **data-7cacb2d2a4** — fetch failed (fetch failed): https://arkiva.punetejashtme.gov.al/en/udhetimi-i-shtetasve-te-huaj-me-barna-per-konsum-minimal/ — used by customs-items.json:prescription-medication-al
- **data-6d8d9a9ad2** — fetch failed (HTTP 403): https://www.gov.cy/mfa/en/documents/categories-of-persons-and-countries-whose-nationals-do-not-require-a-visa/ — used by destinations.json:CY, entry-requirements.json:US, entry-requirements.json:GB (+13 more)
- **data-24fa2e115a** — fetch failed (fetch failed): https://www.diplomatie.ma/en/launch-electronic-visa-evisa — used by entry-requirements.json:IL
- **data-1e984ac23f** — fetch failed (fetch failed): https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/35/9740 — used by entry-requirements.json:IL
- **data-6c619f8ec6** — fetch failed (HTTP 403): https://www.imigrasi.go.id/wna/daftar-negara-voa-bvk-calling-visa/daftar-negara-subjek-visa-on-arrival — used by entry-requirements.json:US, entry-requirements.json:GB, entry-requirements.json:CA (+14 more)
- **data-c388e3f31e** — fetch failed (HTTP 403): https://www.imigrasi.go.id/wna/daftar-negara-voa-bvk-calling-visa/daftar-negara-bebas-visa-kunjungan — used by entry-requirements.json:SG, entry-requirements.json:MY
- **data-9ae4e26838** — fetch failed (HTTP 403): https://www.imigrasi.go.id/wna/daftar-negara-voa-bvk-calling-visa/daftar-negara-subjek-calling-visa — used by entry-requirements.json:IL
- **data-d44ba188e4** — fetch failed (fetch failed): https://www.kln.gov.my/web/sgp_singapore/requirement_malaysians — used by entry-requirements.json:MY
- **data-c6a93114bf** — fetch failed (no readable content (118 chars: JS-rendered page or bot challenge)): https://consulat.ma/fr/liste-des-pays-dont-les-ressortissants-sont-dispenses-du-visa-dentree-au-maroc — used by entry-requirements.json:CN
- **data-9b220389c8** — fetch failed (HTTP 403): https://china.usembassy-china.org.cn/visas/ — used by entry-requirements.json:CN
- **data-a31c310618** — fetch failed (HTTP 403): https://visa.visitsaudi.com — used by entry-requirements.json:IN
- **data-876f4a1fdc** — fetch failed (fetch failed): https://www.kln.gov.my/web/ind_new-delhi/requirement_foreigner — used by entry-requirements.json:IN
- **data-6584787e1c** — fetch failed (fetch failed): https://www.kln.gov.my/web/mex_mexico-city/requirement_foreigner — used by entry-requirements.json:MX
- **data-02a498d36e** — fetch failed (fetch failed): https://www.kln.gov.my/web/arg_buenos-aires/requirement_foreigner — used by entry-requirements.json:AR
- **data-3bf5e81f32** — fetch failed (fetch failed): https://www.kln.gov.my/web/kor_seoul/requirement_foreigner — used by entry-requirements.json:KR
- **data-22afd3c032** — fetch failed (fetch failed): https://www.kln.gov.my/web/chl_santiago/requirement_foreigner — used by entry-requirements.json:CL
- **data-96adf7c986** — fetch failed (HTTP 403): https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Malaysia.html — used by entry-requirements.json:US
- **data-5b1e6fb15d** — fetch failed (fetch failed): https://www.kln.gov.my/web/bra_brasilia/other_information/-/asset_publisher/2TQe/content/other-consular-information-3 — used by entry-requirements.json:BR
- **data-00afcfa281** — fetch failed (HTTP 403): https://al.usembassy.gov/entering-and-residing/ — used by entry-requirements.json:US
- **data-89f9539e62** — fetch failed (no readable content (16 chars: JS-rendered page or bot challenge)): https://www.viaggiaresicuri.it/find-country/country/ALB — used by entry-requirements.json:IT
- **data-e4168c0449** — fetch failed (fetch failed): https://www.kln.gov.my/web/fra_paris/requirement_foreigner — used by entry-requirements.json:FR
- **data-db618c9821** — fetch failed (fetch failed): https://www.kln.gov.my/web/deu_berlin/requirement_foreigner — used by entry-requirements.json:DE
- **data-fb73d2b3dc** — fetch failed (fetch failed): https://www.kln.gov.my/web/ita_rome/requirement_foreigner — used by entry-requirements.json:IT
- **data-5bafa908ac** — fetch failed (fetch failed): https://www.kln.gov.my/web/nld_the-hague/requirement_foreigner — used by entry-requirements.json:NL
- **data-4f507bea86** — fetch failed (no readable content (16 chars: JS-rendered page or bot challenge)): https://www.viaggiaresicuri.it/find-country/country/SGP — used by entry-requirements.json:IT
- **data-ce2dc16ff9** — fetch failed (fetch failed): https://overseas.mofa.go.kr/in-en/wpge/m_2660/contents.do — used by entry-requirements.json:IN
- **data-52b625ebdc** — fetch failed (HTTP 403): https://www.gov.cy/en/information/visas/ — used by entry-requirements.json:CN, entry-requirements.json:IN
- **data-257e9d578f** — fetch failed (The operation was aborted due to timeout): https://www.mof.gov.cy/mof/customs/customs.nsf/All/D8E0334067181B47C22572BF002DF37C — used by customs-items.json:alcohol-cy, customs-items.json:tobacco-cy
- **data-6e159b8b54** — fetch failed (no readable content (0 chars: JS-rendered page or bot challenge)): https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32025R1411 — used by etias.json:row
- **data-bbc8e8ffe3** — fetch failed (HTTP 403): https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043911515 — used by overstay-penalties.json:FR
- **data-53c2bc886e** — fetch failed (HTTP 403): https://www.refworld.org/sites/default/files/attachments/58a6e3d74.pdf — used by overstay-penalties.json:LT
- **data-5eba830891** — fetch failed (no readable content (240 chars: JS-rendered page or bot challenge)): https://legilux.public.lu/eli/etat/leg/loi/2008/08/29/n1/consolide/20240908 — used by overstay-penalties.json:LU
- **data-7623a5564f** — fetch failed (HTTP 404): https://legislationline.org/taxonomy/term/13346 — used by overstay-penalties.json:EE
- **data-97dc3d0928** — fetch failed (HTTP 403): https://www.udi.no/en/word-definitions/expulsion/ — used by overstay-penalties.json:NO
- **data-a904c86520** — fetch failed (HTTP 403): https://www.zakonypreludi.sk/zz/2011-404 — used by overstay-penalties.json:SK
- **data-0a1ce5174b** — fetch failed (HTTP 403): https://rsaegean.org/en/criminalisation-of-illegal-stay-in-greece-puts-almost-300-people-behind-bars/ — used by overstay-penalties.json:GR
- **data-830d5956b0** — fetch failed (fetch failed): https://www.gesetze-im-internet.de/englisch_aufenthg/englisch_aufenthg.html — used by overstay-penalties.json:DE
