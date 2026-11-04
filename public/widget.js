/* global window, document, fetch */
;(() => {
  // Prevent multiple initializations
  if (window.AIChatbot && window.AIChatbot.initialized) {
    return
  }

  const LOGO_URL = "https://nwcmc.gov.in/web/upload_files/website/img/logo/weblogo6364d3f0f495b6ab9dcf8d3b5c6e0b01.png"

  const DIRECT_RTI_REPLY = `Go to this link:\nhttps://nwcmc.gov.in/web/others.php?uid=NDM1&id=ENG#gsc.tab=0\n\nVarious RTS Information available:\n- Right to Information Act, 2005\n- Right to Information Order\n- Right to Information Order – 17/12/2015\n- Right to Information Order – 07/07/2017\n- Right to Information Order – 14/12/2017\n- Right to Information Order – 23/08/2018\n- Right to Information Order – 17/07/2019\n- Right to Information Order – 13/10/2020\n- Right to Information Order – 15/12/2020\n- Right to Information Order – 16/09/2021\n- Right to Information Order – 09/03/2023\n- Information to be Proactively Disclosed under Section 4(1)(b) of the Right to Information Act, 2005 (Computer Department)\n- Information to be Proactively Disclosed under Section 4(1)(b) of the Right to Information Act, 2005 (Stores Department)\n- Information to be Proactively Disclosed under Section 4(1)(b) of the Right to Information Act, 2005 (Computer Department 2024–25)`

  const DIRECT_GRIEVANCE_REPLY = `Steps to Submit a Grievance or Complaint\nStep 1: Log in at:\nhttps://nwcmc.gov.in/web/citizen/grievance/login.php?uid=NzI4&id=ENG&cmd=clear#gsc.tab=0\nUse your Registered Mobile Number to log in.\nIf logging in for the first time, select New Registration.\n\nStep 2: After logging in, open the sidebar menu and select New Complaint.\n\nStep 3: Fill in the required details:\nZone (झोन)*\nDepartment (विभाग)*\nCategory (श्रेणी)*\nPriority (प्राधान्य)*\nAddress (पत्ता)*\nDescription (वर्णन)*\nOptional details:\nWard (प्रभाग)\nFile (फाइल) – if any document needs to be uploaded\n\nStep 4: Click Submit.\nNote: To check the status of your grievance/complaint, go to the sidebar menu and select Complaint List. The current status of your application will be displayed there.`

  const CONTACT_ENGLISH = `📞 Contact:\n+912462234710, +912462234577`

  const CONTACT_MARATHI = `📞 संपर्क: +91 2462 234710, +91 2462 234577`

  const DIRECT_GRIEVANCE_REPLY_MARATHI = `📝 तक्रार/अर्ज सादर करण्याच्या पायऱ्या\nपायरी 1: या लिंकवर लॉगिन करा –\nhttps://nwcmc.gov.in/web/citizen/grievance/login.php?uid=NzI4&id=ENG&cmd=clear#gsc.tab=0\nलॉगिन करण्यासाठी तुमचा नोंदणीकृत मोबाईल नंबर वापरा.\nप्रथम लॉगिन करत असल्यास New Registration निवडा.\n\nपायरी 2: लॉगिन केल्यानंतर, साइडबार मेनूमधून New Complaint निवडा.\n\nपायरी 3: आवश्यक माहिती भरा:\nZone (झोन)*\nDepartment (विभाग)*\nCategory (श्रेणी)*\nPriority (प्राधान्य)*\nAddress (पत्ता)*\nDescription (वर्णन)*\nपर्यायी माहिती:\nWard (प्रभाग)\nFile (फाइल) – आवश्यक असल्यास दस्तऐवज अपलोड करा\n\nपायरी 4: Submit वर क्लिक करा.\nटीप: तुमच्या तक्रारी/अर्जाची स्थिती तपासण्यासाठी, साइडबार मेनूमधून Complaint List निवडा. तुमच्या अर्जाची सद्यस्थिती तिथे दिसेल.`

  const DIRECT_RTI_REPLY_MARATHI = `या लिंकवर जा –\nhttps://nwcmc.gov.in/web/others.php?uid=NDM1&id=ENG&#gsc.tab=0\n\nविविध माहितीचा अधिकार (RTS) संदर्भातील माहिती:\nमाहितीचा अधिकार अधिनियम, 2005\nमाहितीचा अधिकार आदेश\nमाहितीचा अधिकार आदेश – 17/12/2015\nमाहितीचा अधिकार आदेश – 07/07/2017\nमाहितीचा अधिकार आदेश – 14/12/2017\nमाहितीचा अधिकार आदेश – 23/08/2018\nमाहितीचा अधिकार आदेश – 17/07/2019\nमाहितीचा अधिकार आदेश – 13/10/2020\nमाहितीचा अधिकार आदेश – 15/12/2020\nमाहितीचा अधिकार आदेश – 16/09/2021\nमाहितीचा अधिकार आदेश – 09/03/2023\nमाहितीचा अधिकार अधिनियम, 2005 कलम 4(1)(ख) नुसार स्वयंप्रेरणेने जाहीर करावयाची माहिती (संगणक विभाग)\nमाहितीचा अधिकार अधिनियम, 2005 कलम 4(1)(ख) नुसार स्वयंप्रेरणेने जाहीर करावयाची माहिती (भांडार विभाग)\nमाहितीचा अधिकार अधिनियम, 2005 कलम 4(1)(ख) नुसार स्वयंप्रेरणेने जाहीर करावयाची माहिती (संगणक विभाग 2024–25)`

  const ELECTION_MARATHI = `\n**स्थानिक स्वराज्य संस्था मतदार यादी :-**\nया लिंकवर जा :-\nhttps://mahasecvoterlist.in/ObjectionOnClick/SearchName\nआपल्या नावाने किंवा EPIC क्रमांकाने शोधा\n\n\n**उमेदवारांची यादी व इतर माहिती :-**\nhttps://nwcmc.gov.in/web/pdfview.php#gsc.tab=0\n\nवरील लिंकवर मेनूमधून **“उमेदवारांनी सादर केलेले शपथपत्र”** हा पर्याय निवडून विभाग-प्रभाग-गटनिहाय उमेदवारांची यादी व शपथपत्रे पाहू शकता.`

  const ELECTION_ENGLISH = `\n**Local Self Government Voterlist:-**\nGo to this link:-\nhttps://mahasecvoterlist.in/ObjectionOnClick/SearchName\nsearch by your name or EPIC Number Wise\n\n\n**Candidate List and other Information:-**\nhttps://nwcmc.gov.in/web/pdfview.php#gsc.tab=0\n\nyou can view the candidate list and affidavits zone-, ward-, and group-wise by selecting “उमेदवारांनी सादर केलेले शपथपत्र” from the menu on the above link.`

  const AIChatbot = {
    initialized: false,
    config: null,
    isOpen: false,
    messages: [],

    currentLanguage: null,
    currentLevel: "language_select",
    currentTopCategory: null,
    currentMenuContext: null,
    
    storedPin: null,
    selectedDuesType: null,

    getApiBase: function () {
      try {
        if (document.currentScript && document.currentScript.src) {
          const scriptUrl = new URL(document.currentScript.src)
          return scriptUrl.origin
        }
      } catch (e) { /* fall through to window.location */ }
      return window.location.origin
    },

    buildApiUrl: function (path) {
      const base = this.getApiBase()
      const isHttpsPage = window.location.protocol === "https:"
      const url = new URL(path, base)
      if (isHttpsPage && url.protocol === "http:") {
        url.protocol = "https:"
      }
      return url.toString()
    },

    sttSupported: false,
    ttsSupported: false,
    recognition: null,
    isListening: false,
    speaking: false,
    selectedVoice: null,

    MENU_STRUCTURE: {
      english: {
        welcome: "Hi, please choose a category to continue.",
        topCategories: [
          { label: "Citizen Services(RTS)", key: "rts" },
          { label: "Know your Dues", key: "dues"},
          { label: "Municipal Election 2025", key: "election" },
          { label: "Right To Information(RTI)", key: "rti" },
          { label: "View Due and Payment", key: "payments" },
          { label: "Grievance/Complaint", key: "grievance" },
          { label: "Emergency Contact", key: "contact" },
          { label: "Know about Nanded", key: "about" },
        ],
        about: {
          title: "Know about Nanded",
          menus: [
            {
              label: "About Nanded",
              query: "About Nanded",
              submenus: [
                { label: "Your Nanded District", query: "Your Nanded District" },
                { label: "Your Nanded City", query: "Your Nanded City" },
                { label: "Your Municipal Corporation", query: "Your Municipal Corporation" }
              ]
            }
          ]
        },
        rts: {
          title: "Right to Services (RTS)",
          menus: [
            {
              label: "Applied List",
              query: "Applied List",
              submenus: [{ label: "All Application List", query: "All Application List" }],
            },
            {
              label: "Property",
              query: "Property",
              submenus: [
                { label: "New tax Assessment", query: "New Assessment of Property tax" },
                { label: "Re-Assessment of tax", query: "Re-Assessment of Property tax" },
                { label: "Assessment-Demoli & Reconst", query: "Tax Assessment-Demoli & Reconstruct" },
                { label: "Name Transfer–Documents", query: "Name Transfer - By Valid Documents" },
                { label: "Name Transfer - Heirship", query: "Name Transfer - By Heirship" },
                { label: "Name Transfer - Other Way", query: "Name Transfer - By Other Way" },
                { label: "Name Transfer - Division", query: "Name Transfer - By Property Division" },
                { label: "Tax Exemption-Property tax", query: "Tax Exemption for Property tax" },
                { label: "Tax Exemption -Unoccupied", query: "Tax Exemption - Unoccupied" },
                { label: "Raising Tax Objection", query: "Raising Tax Objection" },
                { label: "Self Assessment of Property tax", query: "Self Assessment of Property tax" },
                { label: "Demand Bill of Property tax", query: "Demand Bill of Property tax" },
                { label: "NOC- Property Tax", query: "No Dues Certificate - Property Tax" },
                { label: "Pay Your Property Tax", query: "Pay Your Property Tax" },
                { label: "Property Tax Ledger", query: "Extract of Property Tax Ledger" },
              ],
            },
            {
              label: "Water",
              query: "Water",
              submenus: [
                { label: "New Water Connection", query: "New Water Connection" },
                { label: "No Dues Certificate - Water", query: "No Dues Certificate - Water Charges" },
                { label: "Demand Bill for Water Usage", query: "Demand Bill for Water Usage" },
                { label: "Water Connection Certificate", query: "Water Connection Certificate" },
                { label: "Complaint for Faulty Meter", query: "Complaint for Faulty Meter" },
                { label: "Complaint for Water Pressure", query: "Complaint for Water Pressure" },
                { label: "Complaint for Water Quality", query: "Complaint for Water Quality" },
                { label: "Complaint for Illegal Connection", query: "Complaint for Illegal Connection" },
                { label: "Ownership Change for water", query: "Ownership Change of Water Connection" },
                { label: "Change in Tap Size", query: "Change in Tap Size" },
                { label: "Disconnection of water", query: "Disconnection of Water Connection" },
                { label: "Change in water Usage Category", query: "Change in Water Usage Category" },
                { label: "Re-Connection of Water", query: "Re-Connection of Water Connection" },
                { label: "Plumber License - New", query: "Plumber License - New" },
                { label: " Renewal of Plumber License", query: "Renewal of Plumber License" },
              ],
            },
            {
              label: "No Objection Certificate",
              query: "No Objection Certificate",
              submenus: [
                { label: "NOC for Fire (Provisional)", query: "NOC for Fire (Provisional)" },
                { label: "NOC for Fire - Final", query: "NOC for Fire - Final" },
                { label: "NOC for Fire - Final New", query: "NOC for Fire - Final New" },
                { label: "NOC for Fire - Renewal", query: "NOC for Fire - Renewal" },
                { label: "NOC for Godown/Store/Trade", query: "NOC for Godown/Store/Trade" },
                { label: "NOC for Pendol", query: "NOC for Pendol" },
              ],
            },
            {
              label: "Health",
              query: "Health",
              submenus: [
                { label: "Nursing Home Regi. -New", query: "Nursing Home Registration - New" },
                { label: "Nursing Home Regi. -Renewal", query: "Nursing Home Registration - Renewal" },
                { label: "Nursing Home -Owner Change", query: "Nursing Home Regi. - Ownership Change" },
                { label: "Cleanliness in City", query: "Maintenance of Cleanliness in City" },
              ],
            },
            {
              label: "Birth, Death & Marriage",
              query: "Birth, Death & Marriage",
              submenus: [
                { label: "Birth Certificate", query: "Birth Certificate" },
                { label: "Death Certificate", query: "Death Certificate" },
                { label: "Marriage Certificate", query: "Marriage Certificate" },
              ],
            },
            {
              label: "Advertisement & Movie Shooting",
              query: "Advertisement & Movie Shooting",
              submenus: [
                { label: "Hoarding/Sinage License", query: "Hoarding & Sinage License" },
                { label: "Movies Shooting License", query: "Movies Shooting License" },
              ],
            },
            {
              label: "Garden",
              query: "Garden",
              submenus: [{ label: "Permission for Tree Cutting", query: "Permission for Tree Cutting" }],
            },
            {
              label: "Town Planning",
              query: "Town Planning",
              submenus: [
                { label: "Area Map", query: "Area Map" },
                { label: "Zone Certificate", query: "Zone Certificate" },
                { label: "Building Permission", query: "Building Permission" },
                { label: "Plinth Certificate", query: "Plinth Certificate" },
                { label: "Occupancy Certificate", query: "Occupancy Certificate" },
              ],
            },
            {
              label: "Trade License",
              query: "Trade License",
              submenus: [
                { label: "New Trade License", query: "New Trade License" },
                { label: "Renewal of Trade Licence", query: "Renewal of Trade Licence" },
                { label: "Transfer of Trade Ownership", query: "Transfer of Trade Licence Ownership" },
                { label: "Change in the Firm Name", query: "Change in the Firm Name" },
                { label: "Change in the Trade Category", query: "Change in the Trade Category" },
                { label: "Change in the Partner's Name", query: "Change in the Partner's Name" },
                { label: "Addition/Removal of Partner", query: "Addition/Removal of Partner" },
                { label: "Cancellation of Trade License", query: "Cancellation of Trade License" },
                { label: "Duplicate copy of Trade Licence", query: "Duplicate copy of Trade Licence" },
                { label: "Auto Renewal of Trade Licence", query: "Auto Renewal of Trade Licence" },
                { label: "Notice For Expired Trade Licence", query: "Notice For Expired Trade Licence" },
                { label: "Hawker Registration", query: "Hawker Registration" },
                { label: "Lodging House-New Licence", query: "Lodging House - New Licence" },
                { label: "Lodging House-Renewal Licence", query: "Lodging House - Renewal of Licence" },
                { label: "Function Hall-New Licence", query: "Function Hall - New Licence" },
                { label: "Function Hall-Renewal of Licence", query: "Function Hall - Renewal of Licence" },
              ],
            },
            {
              label: "PWD",
              query: "PWD",
              submenus: [{ label: "To Fill Pot Holes in Road", query: "To Fill Pot Holes in Road" }],
            },
            {
              label: "Sewer",
              query: "Sewer",
              submenus: [
                { label: "New Drainage Connection", query: "New Drainage Connection" },
                { label: "Maintenance of Gutter", query: "Maintenance of Gutter /Manhole Cover" },
              ],
            },
          ],
        },
        payments: {
          title: "View Due and Payment",
          menus: [
            {
              label: "Water",
              query: "Payment - Water",
              submenus: [
                { label: "Payment Steps", query: "Payment Steps for Water" },
                { label: "View Due Details", query: "View Due Details for Water" },
              ],
            },
            {
              label: "Property",
              query: "Payment - Property",
              submenus: [
                { label: "Payment Steps", query: "Payment Steps for Property" },
                { label: "View Due Details", query: "View Due Details for Property" },
              ],
            },
          ],
        },
        rti: {
          title: "Right to Information (RTI)",
          directReply: DIRECT_RTI_REPLY,
          menus: [],
        },
        election: {
          title: "Municipal Election 2025",
          directReply: ELECTION_ENGLISH,
          menus: [],
        },
        grievance: {
          title: "Grievance/Complaint",
          directReply: DIRECT_GRIEVANCE_REPLY,
          menus: [],
        },
        contact: {
          title: "Emergency Contact",
          directReply: CONTACT_ENGLISH,
          menus: [],
        }, 
        other_option: "Other (Ask a question)",
        back_main: "Main Categories",
        back_prev: "Back",
        start_over: "Start Over",
      },

      marathi: {
        welcome: "नमस्कार, पुढे जाण्यासाठी कृपया श्रेणी निवडा.",
        topCategories: [
          { label: "RTS (नागरिक/हक्क सेवा)", key: "rts" },
          { label: "तुमची देणी जाणून घ्या", key: "dues"},
          { label: "महानगरपालिका निवडणुक 2025", key: "election" },
          { label: "RTI (माहितीचा अधिकार)", key: "rti" },
          { label: "महत्वाची देय सेवा", key: "payments" },
          { label: "तक्रार / गाऱ्हाणे", key: "grievance" },
          { label: "📞 आपत्कालीन कॉल क्रमांक", key: "contact" },
          { label: "नांदेडबद्दल माहिती", key: "about" },
        ],
        about: {
          title: "नांदेडबद्दल माहिती",
          menus: [
            {
              label: "नांदेडबद्दल माहिती",
              query: "About Nanded",
              submenus: [
                { label: "तुमचा नांदेड जिल्हा", query: "Your Nanded District" },
                { label: "तुमचे नांदेड शहर", query: "Your Nanded City" },
                { label: "तुमची महानगरपालिका", query: "Your Municipal Corporation" }
              ]
            }
          ]
        },
        rts: {
          title: "RTS (हक्क सेवा)",
          menus: [
            {
              label: "अर्ज केलेली यादी",
              query: "Applied List",
              submenus: [{ label: "अर्ज यादी", query: "All Application List" }],
            },
            {
              label: "मालमत्ता",
              query: "Property",
              submenus: [
                { label: "नवीन मालमत्ता कर मूल्यांकन", query: "New Assessment of Property tax" },
                { label: "मालमत्ता कर पुनर्मूल्यांकन", query: "Re-Assessment of Property tax" },
                { label: "कर मूल्यांकन-पाडणे/पुनर्रचना", query: "Tax Assessment - Demolition & Reconstruct" },
                { label: "दस्तऐवजांवर आधारित नाव बदला", query: "Name Transfer - By Valid Documents" },
                { label: "वारसाहक्कावर आधारित नाव बदला", query: "Name Transfer - By Heirship" },
                { label: "इतर मार्गाने नाव बदला", query: "Name Transfer - By Other Way" },
                { label: "मालमत्ता विभागणीने नाव बदला", query: "Name Transfer - By Property Division" },
                { label: "मालमत्ता करासाठी कर सवलत", query: "Tax Exemption for Property tax" },
                { label: "अवास्तव मालमत्तेसाठी कर सवलत", query: "Tax Exemption - Unoccupied" },
                { label: "कर आक्षेप नोंदवा", query: "Raising Tax Objection" },
                { label: "स्वयं मूल्यांकन मालमत्ता कर", query: "Self Assessment of Property tax" },
                { label: "मालमत्ता कर मागणी बिल", query: "Demand Bill of Property tax" },
                { label: "नो ड्यूस प्रमाणपत्र - कर", query: "No Dues Certificate - Property Tax" },
                { label: "आपला मालमत्ता कर भरा", query: "Pay Your Property Tax" },
                { label: "मालमत्ता कर लेजर उतारा", query: "Extract of Property Tax Ledger" },
              ],
            },
            {
              label: "पाणी",
              query: "Water",
              submenus: [
                { label: "नवीन पाणी कनेक्शन", query: "New Water Connection" },
                { label: "पाणी शुल्क थकबाकी प्रमाणपत्र", query: "No Dues Certificate - Water Charges" },
                { label: "पाणी वापरासाठी मागणी बिल", query: "Demand Bill for Water Usage" },
                { label: "पाणी कनेक्शन प्रमाणपत्र", query: "Water Connection Certificate" },
                { label: "दोषी मीटरसाठी तक्रार", query: "Complaint for Faulty Meter" },
                { label: "पाणी दाबाबद्दल तक्रार", query: "Complaint for Water Pressure" },
                { label: "पाण्याच्या गुणवत्तेबद्दल तक्रार", query: "Complaint for Water Quality" },
                { label: "बेकायदेशीर कनेक्शनसाठी तक्रार", query: "Complaint for Illegal Connection" },
                { label: "कनेक्शनचा मालकी हक्क बदला", query: "Ownership Change of Water Connection" },
                { label: "टॅप आकारात बदल", query: "Change in Tap Size" },
                { label: "पाणी कनेक्शनचे डिसकनेक्शन", query: "Disconnection of Water Connection" },
                { label: "पाणी वापर श्रेणीत बदल", query: "Change in Water Usage Category" },
                { label: "पाणी कनेक्शन पुन्हा जोडा", query: "Re-Connection of Water Connection" },
                { label: "प्लंबर लायसन्स - नवीन", query: "Plumber License - New" },
                { label: "प्लंबर लायसन्स - नूतनीकरण", query: "Renewal of Plumber License" },
              ],
            },
            {
              label: "फायर एनओसी",
              query: "Fire NOC",
              submenus: [
                { label: "फायर एनओसी (तात्पुरती)", query: "NOC for Fire (Provisional)" },
                { label: "फायर एनओसी - अंतिम", query: "NOC for Fire - Final" },
                { label: "फायर एनओसी - अंतिम नवीन", query: "NOC for Fire - Final New" },
                { label: "फायर एनओसी - नूतनीकरण", query: "NOC for Fire - Renewal" },
                { label: "गोडाऊन/स्टोअर/व्यापारासाठी एनओसी", query: "NOC for Godown/Store/Trade" },
                { label: "पंडालसाठी एनओसी", query: "NOC for Pendol" },
              ],
            },
            {
              label: "आरोग्य",
              query: "Health",
              submenus: [
                { label: "नर्सिंग होम नोंदणी -नवीन", query: "Nursing Home Registration - New" },
                { label: "नर्सिंग होम नोंदणी -नूतनीकरण", query: "Nursing Home Registration - Renewal" },
                { label: "नर्सिंग होम नोंदणी -मालकी बदल", query: "Nursing Home Regi. - Ownership Change" },
                { label: "शहरात स्वच्छतेचे देखभाल", query: "Maintenance of Cleanliness in City" },
              ],
            },
            {
              label: "जन्म, मृत्यू व विवाह",
              query: "Birth, Death & Marriage",
              submenus: [
                { label: "जन्म प्रमाणपत्र", query: "Birth Certificate" },
                { label: "मृत्यू प्रमाणपत्र", query: "Death Certificate" },
                { label: "विवाह प्रमाणपत्र", query: "Marriage Certificate" },
              ],
            },
            {
              label: "जाहिरात व चित्रपट चित्रीकरण",
              query: "Advertisement & Movie Shooting",
              submenus: [
                { label: "फलक व साइनज परवाना", query: "Hoarding & Sinage License" },
                { label: "चित्रपट चित्रीकरण परवाना", query: "Movies Shooting License" },
              ],
            },
            {
              label: "उद्यान",
              query: "Garden",
              submenus: [{ label: "झाड तोडण्याची परवानगी", query: "Permission for Tree Cutting" }],
            },
            {
              label: "नगर रचना",
              query: "Town Planning",
              submenus: [
                { label: "क्षेत्र नकाशा", query: "Area Map" },
                { label: "झोन प्रमाणपत्र", query: "Zone Certificate" },
                { label: "बांधकाम परवानगी", query: "Building Permission" },
                { label: "प्लिंथ प्रमाणपत्र", query: "Plinth Certificate" },
                { label: "ऑक्युपंसी प्रमाणपत्र", query: "Occupancy Certificate" },
              ],
            },
            {
              label: "व्यवसाय परवाना",
              query: "Trade License",
              submenus: [
                { label: "नवीन व्यवसाय परवाना", query: "New Trade License" },
                { label: "व्यवसाय परवाना नूतनीकरण", query: "Renewal of Trade Licence" },
                { label: "व्यवसाय परवाना मालकी हक्क बदल", query: "Transfer of Trade Licence Ownership" },
                { label: "फर्म नावात बदल", query: "Change in the Firm Name" },
                { label: "व्यवसाय श्रेणीत बदल", query: "Change in the Trade Category" },
                { label: "भागीदाराच्या नावात बदल", query: "Change in the Partner's Name" },
                { label: "भागीदार समावेश/वगळा", query: "Addition/Removal of Partner" },
                { label: "व्यवसाय परवाना रद्द", query: "Cancellation of Trade License" },
                { label: "परवान्याची डुप्लिकेट प्रत", query: "Duplicate copy of Trade Licence" },
                { label: "परवा आपोआप नूतनीकरण", query: "Auto Renewal of Trade Licence" },
                { label: "कालबाह्य परवान्यासाठी सूचना", query: "Notice For Expired Trade Licence" },
                { label: "हॉकर्स नोंदणी", query: "Hawker Registration" },
                { label: "लॉजिंग हाऊस - नवीन परवाना", query: "Lodging House - New Licence" },
                { label: "लॉजिंग हाऊस - परवाना नूतनीकरण", query: "Lodging House - Renewal of Licence" },
                { label: "फंक्शन हॉल - नवीन परवाना", query: "Function Hall - New Licence" },
                { label: "फंक्शन हॉल - परवाना नूतनीकरण", query: "Function Hall - Renewal of Licence" },
              ],
            },
            {
              label: "सार्वजनिक बांधकाम विभाग",
              query: "PWD",
              submenus: [{ label: "रस्त्यातील खड्डे भरणे", query: "To Fill Pot Holes in Road" }],
            },
            {
              label: "मलनिस्सारण",
              query: "Sewer",
              submenus: [
                { label: "नवीन ड्रेनेज कनेक्शन", query: "New Drainage Connection" },
                { label: "गटर/मॅनहोल कव्हरची देखभाल", query: "Maintenance of Gutter /Manhole Cover" },
              ],
            },
          ],
        },
        payments: {
          title: "देय आणि पेमेंट पहा",
          menus: [
            {
              label: "पाणी",
              query: "Payment - Water",
              submenus: [
                { label: "पेमेंट टप्पे पाणी", query: "Payment Steps for Water" },
                { label: "देय तपशील पहा", query: "View Due Details for Water" },
              ],
            },
            {
              label: "मालमत्ता",
              query: "Payment - Property",
              submenus: [
                { label: "पेमेंट टप्पे मालमत्ता", query: "Payment Steps for Property" },
                { label: "देय तपशील पहा", query: "View Due Details for Property" },
              ],
            },
          ],
        },
        rti: {
          title: "RTI (माहितीचा अधिकार)",
          directReply: DIRECT_RTI_REPLY_MARATHI,
          menus: [],
        },
        election: {
          title: "महानगरपालिका निवडणुक 2025",
          directReply: ELECTION_MARATHI,
          menus: [],
        },
        grievance: {
          title: "तक्रार / गाऱ्हाणे",
          directReply: DIRECT_GRIEVANCE_REPLY_MARATHI,
          menus: [],
        },
        contact: {
          title: "📞 आपत्कालीन कॉल क्रमांक",
          directReply: CONTACT_MARATHI,
          menus: [],
        },
        other_option: "इतर (प्रश्न विचारा)",
        back_main: "मुख्य श्रेणी",
        back_prev: "मागे",
        start_over: "पुन्हा सुरू करा",
      },
    },

    PROPERTY_QUERIES: [
      "New Assessment of Property tax",
      "Re-Assessment of Property tax",
      "Tax Assessment-Demoli & Reconstruct",
      "Tax Assessment - Demolition & Reconstruct",
      "Name Transfer - By Valid Documents",
      "Name Transfer - By Heirship",
      "Name Transfer - By Other Way",
      "Name Transfer - By Property Division",
      "Tax Exemption for Property tax",
      "Tax Exemption - Unoccupied",
      "Raising Tax Objection",
      "Self Assessment of Property tax",
      "Demand Bill of Property tax",
      "No Dues Certificate - Property Tax",
      "Extract of Property Tax Ledger",
    ],

    PROPERTY_SEARCH_QUERIES: [
      "Re-Assessment of Property tax",
      "Tax Assessment-Demoli & Reconstruct",
      "Tax Assessment - Demolition & Reconstruct",
      "Name Transfer - By Valid Documents",
      "Name Transfer - By Heirship",
      "Name Transfer - By Other Way",
      "Name Transfer - By Property Division",
      "Tax Exemption for Property tax",
      "Tax Exemption - Unoccupied",
      "Raising Tax Objection",
      "Self Assessment of Property tax",
      "Demand Bill of Property tax",
      "No Dues Certificate - Property Tax",
      "Extract of Property Tax Ledger",
    ],

    WATER_QUERIES: [
      "New Water Connection",
      "No Dues Certificate - Water Charges",
      "Demand Bill for Water Usage",
      "Water Connection Certificate",
      "Complaint for Faulty Meter",
      "Complaint for Water Pressure",
      "Complaint for Water Quality",
      "Complaint for Illegal Connection",
      "Ownership Change of Water Connection",
      "Change in Tap Size",
      "Disconnection of Water Connection",
      "Change in Water Usage Category",
      "Re-Connection of Water Connection",
      "Plumber License - New",
      "Renewal of Plumber License",
    ],

    WATER_SEARCH_QUERIES: [
      "No Dues Certificate - Water Charges",
      "Demand Bill for Water Usage",
      "Water Connection Certificate",
      "Complaint for Faulty Meter",
      "Complaint for Water Pressure",
      "Complaint for Water Quality",
      "Complaint for Illegal Connection",
      "Ownership Change of Water Connection",
      "Change in Tap Size",
      "Disconnection of Water Connection",
      "Change in Water Usage Category",
      "Re-Connection of Water Connection",
      "Renewal of Plumber License",
    ],

    FIRE_NOC_QUERIES: [
      "NOC for Fire (Provisional)",
      "NOC for Fire - Final",
      "NOC for Fire - Final New",
      "NOC for Fire - Renewal",
      "NOC for Godown/Store/Trade",
      "NOC for Pendol",
    ],

    HEALTH_QUERIES: [
      "Nursing Home Registration - New",
      "Nursing Home Registration - Renewal",
      "Nursing Home Regi. - Ownership Change",
      "Maintenance of Cleanliness in City",
    ],

    TOWN_PLANNING_PORTAL_QUERIES: ["Area Map", "Zone Certificate"],
    TRADE_NEW_QUERIES: ["New Trade License", "Hawker Registration", "Lodging House - New Licence", "Function Hall - New Licence"],
    TRADE_UPDATE_QUERIES: [
      "Renewal of Trade Licence",
      "Transfer of Trade Licence Ownership",
      "Change in the Firm Name",
      "Change in the Trade Category",
      "Change in the Partner's Name",
      "Addition/Removal of Partner",
      "Cancellation of Trade License",
      "Duplicate copy of Trade Licence",
      "Auto Renewal of Trade Licence",
      "Notice For Expired Trade Licence",
      "Lodging House - Renewal of Licence",
      "Function Hall - Renewal of Licence",
    ],

    normalizeText: function (value) {
      return (value || "")
        .toString()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[._]/g, " ")
        .replace(/[–—]/g, "-")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
    },

    isInGroup: function (query, group) {
      return group.includes(query)
    },

    getPortalLinks: function () {
      return {
        citizenLogin: "https://nwcmc.gov.in/web/citizen/rts/citizenlogin.php#gsc.tab=0",
        waterPayment: "https://nwcmc.gov.in/web/citizen/water/waterchargespaymentsearch.php?uid=NDMw&id=ENG&cmd=clear#gsc.tab=0",
        propertyPayment: "https://nwcmc.gov.in/web/citizen/property/ptsearchnanded.php?uid=MjM0&id=ENG&fwdurl=pbill.php#gsc.tab=0",
        birthCertificate: "https://dc.crsorgi.gov.in/crs/Auth/general-public?m=1",
        deathCertificate: "https://dc.crsorgi.gov.in/crs/Auth/general-public?m=2",
        movieShooting: "https://www.filmcell.maharashtra.gov.in/login?m=4",
        buildingPermission: "https://mahavastu.maharashtra.gov.in/index.php?signin=1&m=1",
        plinthCertificate: "https://mahavastu.maharashtra.gov.in/index.php?signin=1&m=2",
        occupancyCertificate: "https://mahavastu.maharashtra.gov.in/index.php?signin=1&m=3",
      }
    },

    getServiceContext: function (canonicalQuery) {
      for (const langKey of ["english", "marathi"]) {
        const lang = this.MENU_STRUCTURE[langKey]
        for (const categoryKey of ["rts", "payments", "about"]) {
          const block = lang[categoryKey]
          if (!block || !block.menus) continue
          for (const menu of block.menus) {
            for (const submenu of menu.submenus || []) {
              if (submenu.query === canonicalQuery) {
                return {
                  categoryKey,
                  menuQuery: menu.query,
                  menuLabel: menu.label,
                  subLabel: submenu.label,
                  langKey,
                }
              }
            }
          }
        }
      }
      return null
    },

    getAliasMap: function () {
      if (this._aliasMap) return this._aliasMap
      const aliasMap = {}
      const addAlias = (alias, canonical) => {
        const key = this.normalizeText(alias)
        if (key) aliasMap[key] = canonical
      }
      for (const langKey of ["english", "marathi"]) {
        const lang = this.MENU_STRUCTURE[langKey]
        for (const categoryKey of ["rts", "payments", "about"]) {
          const block = lang[categoryKey]
          if (!block || !block.menus) continue
          for (const menu of block.menus) {
            for (const submenu of menu.submenus || []) {
              addAlias(submenu.query, submenu.query)
              addAlias(submenu.label, submenu.query)
            }
          }
        }
      }
      addAlias("Application List", "All Application List")
      addAlias("Tax Assessment-Demoli. & Reconstruct", "Tax Assessment-Demoli & Reconstruct")
      addAlias("Tax Assessment - Demolition & Reconstruct", "Demo/Rebuild Assessment")
      addAlias("Re Assessment of Property Tax", "Re-Assessment of Property tax")
      addAlias("Re_Assessment of Property Tax", "Re-Assessment of Property tax")
      addAlias("Pay Property Tax", "Pay Your Property Tax")
      addAlias("Your Nanded District Info", "Your Municipal Corporation")
      this._aliasMap = aliasMap
      return aliasMap
    },

    resolveCanonicalQuery: function (input) {
      const normalized = this.normalizeText(input)
      const aliasMap = this.getAliasMap()
      if (aliasMap[normalized]) return aliasMap[normalized]
      for (const [alias, canonical] of Object.entries(aliasMap)) {
        if (normalized.includes(alias) || alias.includes(normalized)) {
          return canonical
        }
      }
      return null
    },

    buildCitizenPortalResponse: function ({ menuLabel, subLabel, searchField, extraNote }) {
      const links = this.getPortalLinks()
      const isMarathi = this.currentLanguage === "marathi"
      const lines = isMarathi
        ? [
            `${subLabel} साठी प्रक्रिया:`,
            `1. या लिंकवर जा:\n${links.citizenLogin}`,
            `2. नोंदणीकृत मोबाईल नंबरने लॉगिन करा. पहिल्यांदा असल्यास New Registration करा.`,
            `3. '${menuLabel}' मेनू उघडा आणि '${subLabel}' निवडा.`,
            searchField ? `4. ${searchField} टाका आणि Search वर क्लिक करा.` : `4. फॉर्ममधील आवश्यक माहिती भरा.`,
            `5. लाल चिन्हांकित आवश्यक माहिती भरा आणि आवश्यक कागदपत्रे अपलोड करा.`,
            `6. Submit करून अर्जाची पुष्टी करा.`,
            `7. अर्जाची स्थिती पाहण्यासाठी Applied List > Application List मध्ये Application Number वापरा.`,
          ]
        : [
            `${subLabel}:`,
            `1. Open:\n${links.citizenLogin}`,
            `2. Log in with your registered mobile number. If you are a first-time user, use New Registration.`,
            `3. Open the '${menuLabel}' menu and choose '${subLabel}'.`,
            searchField ? `4. Enter ${searchField} and click Search.` : `4. Fill the application form details.`,
            `5. Complete all required fields marked in red and upload documents if prompted.`,
            `6. Submit and confirm the application.`,
            `7. To track status, open Applied List > Application List and use your Application Number.`,
          ]
      if (extraNote) lines.push(extraNote)
      return lines.join("\n")
    },

    buildPaymentResponse: function ({ heading, link, searchField, allowOwnerName }) {
      const isMarathi = this.currentLanguage === "marathi"
      const searchSuffix = allowOwnerName
        ? isMarathi
          ? `${searchField} किंवा मालकाचे नाव टाका.`
          : `${searchField}, or owner name.`
        : isMarathi
          ? `${searchField} टाका.`
          : `${searchField}.`
      const lines = isMarathi
        ? [
            `${heading}:`,
            `1. या लिंकवर जा:\n${link}`,
            `2. ${searchSuffix}`,
            `3. View/Search वर क्लिक करून थकबाकी/तपशील पहा.`,
            `4. देय रक्कम असल्यास Pay Now वर क्लिक करा.`,
            `5. Credit Card, Debit Card, UPI किंवा Net Banking.यापैकी पर्याय निवडा.`,
            `6. पेमेंट पूर्ण करून receipt डाउनलोड करा.`,
          ]
        : [
            `${heading}:`,
            `1. Open:\n${link}`,
            `2. Enter ${searchSuffix}`,
            `3. Click View/Search to see details and any pending dues.`,
            `4. If payment is pending, click Pay Now.`,
            `5. Choose Credit Card, Debit Card, UPI or Net Banking.`,
            `6. Complete payment and download the receipt.`,
          ]
      return lines.join("\n")
    },

    buildExternalLinkCardResponse: function (link) {
      return this.renderLinkBox(link)
    },

    buildExternalLinkResponse: function (heading, link, note) {
      const isMarathi = this.currentLanguage === "marathi"
      const lines = isMarathi
        ? [
            `${heading}:`,
            `ही सेवा या लिंकवर उपलब्ध आहे:\n${link}`,
            note || `लिंक उघडून पुढील सूचनांनुसार अर्ज करा.`,
          ]
        : [
            `${heading}:`,
            `Use this link:\n${link}`,
            note || `Open the link and follow the on-screen steps.`,
          ]
      return lines.join("\n")
    },

    renderLinkBox: function(link) {
      const btnText = this.currentLanguage === "marathi" ? "इथे क्लिक करा" : "Click Here"
      const externalLinkIcon = `
        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      `

      return `<div style="margin: 8px 0; display: block;"><a href="${link}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; max-width: 100%; height: auto; min-height: 32px; padding: 6px 14px; border: 1.5px solid #FFC107; border-radius: 6px; background-color: #fff8e1; color: #d97706; text-decoration: none; font-size: 13px; font-weight: bold; white-space: nowrap; box-sizing: border-box; transition: all 0.2s ease-in-out; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"><span style="line-height: 1.2; display: inline-block;">${btnText}</span><span style="display: inline-flex; align-items: center; flex-shrink: 0;">${externalLinkIcon}</span></a></div>`
    },

    getStaticResponse: function (input, menuQuery = null, subQuery = null) {
      const canonical = subQuery || this.resolveCanonicalQuery(input)

      if (canonical === "Your Nanded District") {
        return this.buildExternalLinkCardResponse("https://nwcmc.gov.in/web/upload_files/website/img/about/about-link1.pdf")
      }

      if (canonical === "Your Nanded City") {
        return this.buildExternalLinkCardResponse("https://nwcmc.gov.in/web/upload_files/website/img/about/about-link4.pdf")
      }

      if (canonical === "Your Municipal Corporation" || canonical === "Your Nanded District Info") {
        return this.buildExternalLinkCardResponse("https://nwcmc.gov.in/web/upload_files/website/img/about/about-link3.pdf")
      }

      if (!canonical) {
        return this.currentLanguage === "marathi"
          ? "क्षमस्व, या विजेटमध्ये फक्त पूर्वनिर्धारित प्रश्नांची स्थिर उत्तरे उपलब्ध आहेत. कृपया दिलेल्या मेनूमधून पर्याय निवडा."
          : "Sorry, this widget now supports only predefined static questions. Please choose one of the listed menu options."
      }

      const links = this.getPortalLinks()
      const context = this.getServiceContext(canonical) || {
        menuLabel: menuQuery || "Service",
        subLabel: canonical,
      }
      const subLabel = context.subLabel || canonical
      const menuLabel = context.menuLabel || menuQuery || "Service"

      if (canonical === "All Application List") {
        return this.currentLanguage === "marathi"
          ? `All Application List / अर्ज यादी:
1. या लिंकवर लॉगिन करा:
${links.citizenLogin}
2. Registered Mobile Number वापरून लॉगिन करा.
3. 'Applied List' मेनू उघडा.
4. 'All Application List' / 'Application List' निवडा.
5. Application Number वापरून अर्जाची सद्यस्थिती पहा.`
          : `All Application List:
1. Open:
${links.citizenLogin}
2. Log in with your registered mobile number.
3. Open the 'Applied List' menu.
4. Choose 'All Application List' / 'Application List'.
5. Use the Application Number to view the current status of your request.`
      }

      if (canonical === "Pay Your Property Tax") {
        return this.buildPaymentResponse({
          heading: subLabel,
          link: links.propertyPayment,
          searchField: this.currentLanguage === "marathi" ? "PIN, जुना होल्डिंग क्रमांक" : "PIN or old holding number",
          allowOwnerName: true,
        })
      }

      if (this.isInGroup(canonical, this.PROPERTY_QUERIES)) {
        return this.buildCitizenPortalResponse({
          menuLabel,
          subLabel,
          searchField: this.isInGroup(canonical, this.PROPERTY_SEARCH_QUERIES)
            ? this.currentLanguage === "marathi"
              ? "PIN किंवा जुना होल्डिंग क्रमांक"
              : "your PIN or old holding number"
            : null,
          extraNote:
            canonical === "Tax Assessment-Demoli & Reconstruct" || canonical === "Tax Assessment - Demolition & Reconstruct"
        })
      }

      if (this.isInGroup(canonical, this.WATER_QUERIES)) {
        return this.buildCitizenPortalResponse({
          menuLabel,
          subLabel,
          searchField: this.isInGroup(canonical, this.WATER_SEARCH_QUERIES)
            ? this.currentLanguage === "marathi"
              ? "Service Number"
              : "your service number"
            : null,
        })
      }

      if (this.isInGroup(canonical, this.FIRE_NOC_QUERIES)) {
        let searchField = null
        if (canonical === "NOC for Fire - Final New") {
          searchField = this.currentLanguage === "marathi" ? "Provisional/Temporary Number" : "your provisional or temporary number"
        } else if (canonical === "NOC for Fire - Renewal") {
          searchField = this.currentLanguage === "marathi" ? "Certificate Number" : "your certificate number"
        }
        return this.buildCitizenPortalResponse({ menuLabel, subLabel, searchField })
      }

      if (canonical === "Nursing Home Registration - New") {
        return this.buildCitizenPortalResponse({ menuLabel, subLabel, searchField: null })
      }
      if (canonical === "Nursing Home Registration - Renewal" || canonical === "Nursing Home Regi. - Ownership Change") {
        return this.buildCitizenPortalResponse({
          menuLabel,
          subLabel,
          searchField: this.currentLanguage === "marathi" ? "Certificate Number" : "your certificate number",
        })
      }
      if (canonical === "Maintenance of Cleanliness in City") {
        return this.buildCitizenPortalResponse({
          menuLabel,
          subLabel,
          searchField: null,
        })
      }

      if (canonical === "Birth Certificate") {
        return this.buildExternalLinkResponse(
          subLabel,
          links.birthCertificate,
          this.currentLanguage === "marathi"
            ? "लिंक उघडून पुढील प्रक्रिया पूर्ण करा."
            : " Open the link and complete the online process.",
        )
      }
      if (canonical === "Death Certificate") {
        return this.buildExternalLinkResponse(
          subLabel,
          links.deathCertificate,
          this.currentLanguage === "marathi"
            ? "लिंक उघडून पुढील प्रक्रिया पूर्ण करा."
            : "Open the link and complete the online process.",
        )
      }
      if (canonical === "Marriage Certificate") {
        return this.buildCitizenPortalResponse({
          menuLabel,
          subLabel,
          searchField: null,
          extraNote:
            this.currentLanguage === "marathi"
              ? "टीप: फॉर्ममध्ये पती, पत्नी, पुजारी आणि साक्षीदार अशी 4 विभागांची माहिती भरावी लागते."
              : "Note: The application includes 4 sections: husband, wife, priest, and witness details.",
        })
      }

      if (canonical === "Hoarding & Sinage License") {
        return this.buildCitizenPortalResponse({ menuLabel, subLabel, searchField: null })
      }
      if (canonical === "Movies Shooting License") {
        return this.buildExternalLinkResponse(
          subLabel,
          links.movieShooting,
          this.currentLanguage === "marathi"
            ? "Please या लिंकचा वापर करून Movie Shooting License Application fill करा"
            : "Use this link to fill movie shooting license application.",
        )
      }
      if (canonical === "Permission for Tree Cutting") {
        return this.buildCitizenPortalResponse({ menuLabel, subLabel, searchField: null })
      }

      if (this.isInGroup(canonical, this.TOWN_PLANNING_PORTAL_QUERIES)) {
        return this.buildCitizenPortalResponse({ menuLabel, subLabel, searchField: null })
      }
      if (canonical === "Building Permission") {
        return this.buildExternalLinkResponse(
          subLabel,
          links.buildingPermission,
          this.currentLanguage === "marathi"
            ? "कृपया Building Permission साठी link वापरा."
            : "Use this link to get Building Permission.",
        )
      }
      if (canonical === "Plinth Certificate") {
        return this.buildExternalLinkResponse(
          subLabel,
          links.plinthCertificate,
          this.currentLanguage === "marathi"
            ? "कृपया Plinth Certificate साठी link वापरा."
            : "Use this link to get Plinth Certificate.",
        )
      }
      if (canonical === "Occupancy Certificate") {
        return this.buildExternalLinkResponse(
          subLabel,
          links.occupancyCertificate,
          this.currentLanguage === "marathi"
            ? "कृपया Occupancy Certificate साठी link वापरा."
            : "Use this link to get Occupancy Certificate.",
        )
      }

      if (this.isInGroup(canonical, this.TRADE_NEW_QUERIES) || canonical === "New Trade License") {
        return this.buildCitizenPortalResponse({ menuLabel, subLabel, searchField: null })
      }
      if (this.isInGroup(canonical, this.TRADE_UPDATE_QUERIES)) {
        return this.buildCitizenPortalResponse({
          menuLabel,
          subLabel,
          searchField: this.currentLanguage === "marathi" ? "License Number किंवा Application Number" : "your license number or application number",
        })
      }

      if (canonical === "To Fill Pot Holes in Road" || canonical === "New Drainage Connection" || canonical === "Maintenance of Gutter /Manhole Cover") {
        return this.buildCitizenPortalResponse({ menuLabel, subLabel, searchField: null })
      }

      if (canonical === "Payment Steps for Water" || canonical === "View Due Details for Water") {
        return this.buildPaymentResponse({
          heading: subLabel,
          link: links.waterPayment,
          searchField: this.currentLanguage === "marathi" ? "Service Number किंवा Old Holding Number" : "your service number or old holding number",
          allowOwnerName: false,
        })
      }
      if (canonical === "Payment Steps for Property" || canonical === "View Due Details for Property") {
        return this.buildPaymentResponse({
          heading: subLabel,
          link: links.propertyPayment,
          searchField: this.currentLanguage === "marathi" ? "PIN किंवा Old Holding Number" : "your PIN or old holding number",
          allowOwnerName: true,
        })
      }

      return this.currentLanguage === "marathi"
        ? "क्षमस्व, या प्रश्नासाठी स्थिर उत्तर उपलब्ध नाही. कृपया दिलेल्या पर्यायांमधून योग्य प्रश्न निवडा."
        : "Sorry, no static answer is configured for this question yet. Please choose one of the listed options."
    },

    init: function (config) {
      if (this.initialized) return
      this.config = config
      this.initialized = true
      this.createWidget()
      this.attachEventListeners()
      this.resetChat()
      this.initVoice()
    },

    createWidget: function () {
      const widgetContainer = document.createElement("div")
      widgetContainer.id = "ai-chatbot-widget"
      widgetContainer.innerHTML = `
        <style>
          #ai-chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            font-family: ${this.config.theme.fontFamily};
          }
          #ai-chatbot-greeting-curve {
            position: absolute;
            bottom: 17px;
            right: -54px;
            width: 180px;
            height: 100px;
            pointer-events: none;
          }
          #ai-chatbot-greeting-curve svg {
            width: 100%;
            height: 100%;
          }
          #ai-chatbot-greeting-curve text {
            fill: #00a8e8;
            font-size: 18px;
            font-weight: bold;
            font-family: 'Comic Sans MS', cursive, sans-serif;
          }
          .wave-emoji {
            position: absolute;
            left: 8px;
            bottom: 23px;
            font-size: 22px;
            animation: wave 1.2s infinite;
          }
          @keyframes wave {
            0% { transform: rotate(0.0deg); }
            10% { transform: rotate(14.0deg); }
            20% { transform: rotate(-8.0deg); }
            30% { transform: rotate(14.0deg); }
            40% { transform: rotate(-4.0deg); }
            50% { transform: rotate(10.0deg); }
            60% { transform: rotate(0.0deg); }
            100% { transform: rotate(0.0deg); }
          }
          #ai-chatbot-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #2a3864;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          #ai-chatbot-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          }
          #ai-chatbot-window {
            position: absolute;
            bottom: 55px;
            right: 0;
            width: 320px;
            height: 440px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            display: none;
            flex-direction: column;
            overflow: hidden;
          }
          #ai-chatbot-header {
            background: #111844;
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 20px;
          }
          #ai-chatbot-header h3 {
            margin: 0;
            color: white;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .ai-chatbot-header-logo { height: 24px; width: auto; }
          #ai-chatbot-close {
            background: none; border: none; color: white; cursor: pointer;
            font-size: 20px; padding: 0; width: 24px; height: 24px;
            display: flex; align-items: center; justify-content: center;
          }
          #ai-chatbot-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #fff;
          }
          .ai-chatbot-message {
            max-width: 80%;
            padding: 8px 14px;
            border-radius: 14px;
            font-size: 13px;
            line-height: 1.4;
            font-weight: 500;
          }
          .ai-chatbot-message.user {
            background: #2b3e6b;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            font-weight: 600;
          }
          .ai-chatbot-message.bot {
            background: #eef2f7;
            color: #2c3e50;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            font-size: 13px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            max-width: 85%;
          }
          .ai-chatbot-message.bot a {
            color: #007bff;
            text-decoration: underline;
            word-break: break-all;
          }
          .ai-chatbot-message.bot a:hover {
            color: rgb(15, 0, 83)
          }
          .ai-chatbot-message.typing {
            background: #f1f5f9;
            color: #64748b;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .ai-chatbot-welcome-logo-container {
            display: block;
            min-height: 110px;
            margin: auto;
          }
          .ai-chatbot-welcome-logo {
            max-height: 90px; 
            object-fit: contain;
          }
          #ai-chatbot-input-container {
            padding: 12px 16px; 
            border-top: 1px solid #e2e8f0; 
            display: flex; 
            align-items: center;
            gap: 8px;
          }
          #ai-chatbot-input {
            flex: 1; border: 1px solid #e2e8f0; 
            border-radius: 20px; 
            padding: 8px 16px;
            font-size: 14px; 
            outline: none; 
            resize: none; 
            font-family: inherit; 
            scrollbar-width: none;
            height: 40px;
          }
          #ai-chatbot-input:focus { border-color: ${this.config.theme.primaryColor}; }
          #ai-chatbot-mic {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 50%;
            width: 36px; height: 36px;
            cursor: pointer;
            display: inline-flex; align-items: center; justify-content: center;
            transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
            flex-shrink: 0;
          }
          #ai-chatbot-mic:hover { transform: scale(1.05); background: #e2e8f0; }
          #ai-chatbot-mic svg { width: 16px; height: 16px; fill: #334155; }
          #ai-chatbot-mic.listening { background: #ef4444; border-color: #ef4444; }
          #ai-chatbot-mic.listening svg { fill: #fff; }
          #ai-chatbot-mic:disabled { opacity: 0.5; cursor: not-allowed; }
          #ai-chatbot-send {
            background: ${this.config.theme.primaryColor}; border: none; border-radius: 50%;
            width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: opacity 0.2s;
            flex-shrink: 0;
          }
          #ai-chatbot-send:disabled { opacity: 0.5; cursor: not-allowed; }
          #ai-chatbot-send svg { width: 16px; height: 16px; fill: white; }
          .ai-chatbot-buttons-container {
            display: flex; flex-direction: column; gap: 8px; margin-top: 4px; width: 100%; align-items: flex-start;
          }
          .ai-chatbot-button-option {         
            background: #e8eef5;
            border: 1px solid #d0dce8;
            border-radius: 12px;
            padding: 10px 16px;
            font-size: 13px;
            color: #0d1b2a;
            cursor: pointer;
            text-align: left;
            width: 90%;
            transition: background 0.2s, border-color 0.2s;
            font-weight: 600;
            box-sizing: border-box;
          }
          .dot-flashing {
            display: inline-block;
            position: relative;
            width: 12px;
            height: 4px;
          }
          .dot-flashing::before,
          .dot-flashing::after,
          .dot-flashing div {
            content: "";
            display: inline-block;
            position: absolute;
            top: 0;
            width: 4px;
            height: 4px;
            background: #999;
            border-radius: 50%;
            animation: dotFlashing 1s infinite linear alternate;
          }
          .dot-flashing div {
            left: 6px;
            animation-delay: 0.2s;
          }
          .dot-flashing::after {
            left: 12px;
            animation-delay: 0.4s;
          }
          @keyframes dotFlashing {
            0% { opacity: .2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: .2; transform: scale(1); }
          }
          .ai-chatbot-button-option:hover { background: #dbe4f0; border-color: #b8ccdf; }
          
          /* Styles for accordion replies dropping down directly under the button */
          .ai-chatbot-accordion-reply {
            margin: 0 0 8px 0 !important;
            width: 90% !important;
            background: transparent !important;
            border: none !important;
            padding: 6px 8px !important;
            color: #334155 !important;
            font-size: 11px !important;
            box-sizing: border-box;
            animation: slideDown 0.2s ease-out forwards;
            transform-origin: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
          }
          .ai-chatbot-accordion-reply a { color: #007bff; text-decoration: underline; word-break: break-all; }
          .ai-chatbot-accordion-reply a:hover { color: rgb(15, 0, 83); }
          @keyframes slideDown {
            from { opacity: 0; transform: scaleY(0); }
            to { opacity: 1; transform: scaleY(1); }
          }

          /* Dues Form & Card Styling */
          .dues-form-container {
            display: flex;
            gap: 6px;
            width: 90%;
            margin-top: 6px;
            margin-bottom: 8px;
          }
          .dues-input-pin {
            flex: 1;
            padding: 6px 10px;
            font-size: 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            outline: none;
          }
          .dues-send-btn {
            background: #2a3864;
            color: #fff;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
          }
          .dues-send-btn:hover {
            background: #111844;
          }
          .dues-card {
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            margin: 8px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            font-size: 12px;
            color: #334155;
            width: 90%;
            box-sizing: border-box;
          }
          .dues-card-title {
            font-weight: bold;
            font-size: 13px;
            color: #1e293b;
            margin-bottom: 8px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 4px;
          }
          .dues-card-row {
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
          }
          .dues-card-row strong {
            color: #475569;
          }
          .dues-pay-btn {
            display: block;
            text-align: center;
            background: #16a34a;
            color: #ffffff !important;
            text-decoration: none !important;
            font-weight: bold;
            padding: 8px;
            border-radius: 6px;
            margin-top: 10px;
            transition: background 0.2s;
          }
          .dues-pay-btn:hover {
            background: #15803d !important;
          }
          .dues-error-card {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            color: #991b1b;
            padding: 10px;
            border-radius: 8px;
            font-size: 12px;
            margin: 8px 0;
            width: 90%;
            box-sizing: border-box;
          }

          @media (max-width: 480px) {
            #ai-chatbot-window { width: calc(100vw - 40px); height: calc(100vh - 100px); bottom: 80px; right: 20px; }
          }
        </style>
         
        <div id="ai-chatbot-greeting-curve">
          <span class="wave-emoji">👋</span>
          <svg viewBox="0 0 300 100">
            <defs>
              <path id="curvePath" d="M 50 80 Q 150 0 250 80" />
            </defs>
            <text width="100%">
              <textPath href="#curvePath" startOffset="50%" text-anchor="middle">
                How can we assist?
              </textPath>
            </text>
          </svg>
        </div>

        <button id="ai-chatbot-button" title="Open Chat">
          <img src="https://nwcmc.gov.in/web/upload_files/website/img/logo/weblogo6364d3f0f495b6ab9dcf8d3b5c6e0b01.png" alt="Open Chat" style="height: 45px;">
        </button>

        <div id="ai-chatbot-window">
          <div id="ai-chatbot-header">
            <h3><img src="${LOGO_URL}" alt="NWCMC Logo" class="ai-chatbot-header-logo" /> NWCMC Assistant</h3>
            <button id="ai-chatbot-close" aria-label="Close">&times;</button>
          </div>
          <div id="ai-chatbot-messages"></div>
          <div id="ai-chatbot-input-container">
            <textarea id="ai-chatbot-input" placeholder="Type your message..." aria-label="Message input"></textarea>
            <button id="ai-chatbot-mic" aria-label="Voice input" title="Voice input">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 7a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7zm-1 3h2v-2h-2v2z"/>
              </svg>
            </button>
            <button id="ai-chatbot-send" disabled aria-label="Send">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      `
      document.body.appendChild(widgetContainer)
    },

    attachEventListeners: function () {
      const button = document.getElementById("ai-chatbot-button")
      const closeBtn = document.getElementById("ai-chatbot-close")
      const input = document.getElementById("ai-chatbot-input")
      const sendBtn = document.getElementById("ai-chatbot-send")
      const micBtn = document.getElementById("ai-chatbot-mic")

      button.addEventListener("click", () => this.toggleWidget())
      closeBtn.addEventListener("click", () => this.closeWidget())

      input.addEventListener("input", () => {
        sendBtn.disabled = !input.value.trim()
        this.autoResize(input)
      })
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          this.sendMessage()
        }
      })
      sendBtn.addEventListener("click", () => this.sendMessage())

      if (micBtn) {
        micBtn.addEventListener("click", async () => {
          if (!this.sttSupported) {
            this.addMessageToHistory(
              this.currentLanguage === "marathi"
                ? "क्षमस्व, तुमच्या ब्राउझरमध्ये आवाज इनपुट समर्थित नाही."
                : "Sorry, voice input is not supported in your browser.",
            )
            return
          }
          if (this.isListening) {
            this.stopListening(true)
          } else {
            await this.startListening()
          }
        })
      }
    },

    toggleWidget: function () {
      const windowElement = document.getElementById("ai-chatbot-window")
      if (this.isOpen) {
        this.closeWidget()
      } else {
        windowElement.style.display = "flex"
        this.isOpen = true
        this.renderMessages()
        document.getElementById("ai-chatbot-input").focus()
        this.updateInputState()
      }
    },

    closeWidget: function () {
      const windowElement = document.getElementById("ai-chatbot-window")
      windowElement.style.display = "none"
      this.isOpen = false
    },

    autoResize: (textarea) => {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px"
    },

    escapeHtml: function (str) {
      // Escape HTML special characters — untrusted text (bot replies, API data)
      // must never be injected as markup (XSS protection).
      return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
    },

    sanitizeUrl: function (url) {
      // Accept only clean https URLs; anything else returns null.
      if (typeof url !== "string") return null
      if (!/^https:\/\/[A-Za-z0-9._~:\/?#@!$&'()*+,;=%-]+$/.test(url)) return null
      return url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
    },

    linkify: function (text) {
      const urlRegex = /(https?:\/\/[^\s<>"']+)/g
      return this.escapeHtml(text || "").replace(urlRegex, (url) => {
        const safe = this.sanitizeUrl(url)
        if (!safe) return url // keep escaped text if URL looks suspicious
        return this.renderLinkBox(safe)
      })
    },

    renderMessages: function () {
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      messagesContainer.innerHTML = ""

      this.messages.forEach((msg) => {
        if (msg.type === "text") {
          const messageDiv = document.createElement("div")
          messageDiv.classList.add("ai-chatbot-message", msg.isUser ? "user" : "bot")
          
          if (msg.isUser) {
            messageDiv.textContent = msg.content || ""
          } else {
            const content = msg.content || ""
            messageDiv.innerHTML = this.linkify(content)
              .replace(/\n\n/g, "<br><br>")
              .replace(/\n/g, "<br>")
              .replace(/(?:^|\n)- (.*?)(?=\n|$)/g, "<br>&bull; $1")
          }
          messagesContainer.appendChild(messageDiv)
        } else if (msg.type === "typing") {
          const typingDiv = document.createElement("div")
          typingDiv.classList.add("ai-chatbot-message", "typing")
          typingDiv.innerHTML = `<div class="dot-flashing"></div>`
          messagesContainer.appendChild(typingDiv)
        } else if (msg.type === "buttons") {
          this.appendButtonsToDOM(msg.buttons)
        } else if (msg.type === "welcome_logo") {
          const logoContainer = document.createElement("div")
          logoContainer.className = "ai-chatbot-welcome-logo-container"
          logoContainer.innerHTML = `<img src="${LOGO_URL}" alt="Welcome Logo" class="ai-chatbot-welcome-logo" />`
          messagesContainer.appendChild(logoContainer)
        }
      })

      messagesContainer.scrollTop = messagesContainer.scrollHeight
    },

    addMessageToHistory: function (content, isUser = false, type = "text") {
      this.messages.push({ type, content, isUser })
      if (this.isOpen) this.renderMessages()
    },

    addButtonsToHistory: function (buttons) {
      this.messages.push({ type: "buttons", buttons })
      if (this.isOpen) this.renderMessages()
    },

    appendButtonsToDOM: function (buttons) {
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      const buttonsContainer = document.createElement("div")
      buttonsContainer.className = "ai-chatbot-buttons-container"

      buttons.forEach((btn) => {
        const buttonElement = document.createElement("button")
        buttonElement.className = "ai-chatbot-button-option"
        buttonElement.textContent = btn.label
        buttonElement.dataset.action = btn.action 
        buttonElement.dataset.value = btn.value || ""
        if (btn.top) buttonElement.dataset.top = btn.top
        if (btn.menuQuery) buttonElement.dataset.menuQuery = btn.menuQuery
        if (btn.subQuery) buttonElement.dataset.subQuery = btn.subQuery

        buttonElement.addEventListener("click", () => this.handleButtonClick(buttonElement))
        buttonsContainer.appendChild(buttonElement)
      })
      messagesContainer.appendChild(buttonsContainer)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    },

    updateInputState: function () {
      const input = document.getElementById("ai-chatbot-input")
      const sendBtn = document.getElementById("ai-chatbot-send")
      const micBtn = document.getElementById("ai-chatbot-mic")

      if (this.currentLevel === "free_text") {
        input.disabled = false
        sendBtn.disabled = !input.value.trim()
        input.focus()
      } else {
        input.disabled = true
        sendBtn.disabled = true
      }

      if (micBtn) {
        if (this.sttSupported) {
          micBtn.disabled = false
          micBtn.style.opacity = "1"
          micBtn.style.cursor = "pointer"
        } else {
          micBtn.disabled = true
          micBtn.style.opacity = "0.5"
          micBtn.style.cursor = "not-allowed"
        }
      }
    },

    resetChat: function () {
      this.messages = []
      this.currentLanguage = null
      this.currentLevel = "language_select"
      this.currentTopCategory = null
      this.currentMenuContext = null
      this.storedPin = null
      this.selectedDuesType = null

      this.addMessageToHistory(null, false, "welcome_logo")
      this.addMessageToHistory("Welcome to NWCMC Assistant / NWCMC सहाय्यकात स्वागत — Choose Language / भाषा निवडा")
      this.addButtonsToHistory([
        { label: "English", action: "language", value: "english" },
        { label: "Marathi", action: "language", value: "marathi" },
      ])
      this.updateInputState()
    },

    showTopCategories: function () {
      const lang = this.MENU_STRUCTURE[this.currentLanguage]
      this.addMessageToHistory("")
      const buttons = lang.topCategories.map((c) => ({
        label: c.label,
        action: "top",
        top: c.key,
      }))
      buttons.push(
        { label: lang.other_option, action: "other" },
        { label: lang.start_over, action: "start_over" }
      )
      this.addButtonsToHistory(buttons)
      this.updateInputState()
    },

    showDuesCategorySelection: function () {
      const lang = this.MENU_STRUCTURE[this.currentLanguage]
      const isMarathi = this.currentLanguage === "marathi"
      
      const duesTitle = isMarathi ? "तुमची देणी जाणून घ्या" : "Know your Dues"
      const labelWater = isMarathi ? "पाणी" : "Water"
      const labelProp = isMarathi ? "मालमत्ता" : "Property"

      this.addMessageToHistory(duesTitle, true)
      this.addMessageToHistory(duesTitle, false)

      const buttons = [
        { label: labelWater, action: "dues_type", value: "water" },
        { label: labelProp, action: "dues_type", value: "property" },
        { label: lang.back_main, action: "back_to_top" },
        { label: lang.other_option, action: "other" },
        { label: lang.start_over, action: "start_over" }
      ]

      this.addButtonsToHistory(buttons)
      this.updateInputState()
    },

    showPinForm: function (buttonElement) {
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      
      const existingForm = messagesContainer.querySelector(".dues-form-container")
      if (existingForm) {
        const pinInput = existingForm.querySelector(".dues-input-pin")
        if (pinInput) pinInput.focus()
        existingForm.scrollIntoView({ behavior: "smooth", block: "nearest" })
        return
      }

      const isMarathi = this.currentLanguage === "marathi"
      const isWater = this.selectedDuesType === "water"

      const promptText = isWater 
        ? (isMarathi ? "कृपया तुमचा सर्व्हिस नंबर प्रविष्ट करा:" : "Please enter your Service Number:")
        : (isMarathi ? "कृपया तुमचा PIN प्रविष्ट करा:" : "Please enter your PIN:")

      const placeholderText = isWater
        ? (isMarathi ? "सर्व्हिस नंबर प्रविष्ट करा" : "Enter Service Number")
        : (isMarathi ? "PIN प्रविष्ट करा" : "Enter PIN")

      const sendText = isMarathi ? "पाठवा" : "Send"

      this.addMessageToHistory(promptText, false)

      const formDiv = document.createElement("div")
      formDiv.className = "dues-form-container"
      formDiv.innerHTML = `
        <input type="text" id="dues-pin" name="dues-pin" autocomplete="off" class="dues-input-pin" placeholder="${placeholderText}" />
        <button class="dues-send-btn">${sendText}</button>
      `
      const sendBtn = formDiv.querySelector(".dues-send-btn")
      const pinInput = formDiv.querySelector(".dues-input-pin")

      sendBtn.addEventListener("click", () => {
        const inputValue = pinInput.value.trim()
        if (!inputValue) return
        this.storedPin = inputValue
        
        this.addMessageToHistory(inputValue, true)
        formDiv.remove()
        
        this.fetchDuesDetails(inputValue)
      })

      pinInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          sendBtn.click()
        }
      })

      messagesContainer.appendChild(formDiv)
      pinInput.focus()
      formDiv.scrollIntoView({ behavior: "smooth", block: "nearest" })
    },

    fetchDuesDetails: async function (inputValue) {
      const isMarathi = this.currentLanguage === "marathi"
      const isWater = this.selectedDuesType === "water"
      this.addMessageToHistory("typing...", false, "typing")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      let requestPayload = {}
      let apiEndpoint = "/api/dues/"

      if (isWater) {
        apiEndpoint = "/api/dues/water/"
        requestPayload = { serviceno: inputValue, service_no: inputValue }
      } else {
        requestPayload = { pin: inputValue, type: this.selectedDuesType }
      }

      try {
        const response = await fetch(this.buildApiUrl(apiEndpoint), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error("HTTP " + response.status)
        }

        const data = await response.json()
        this.messages = this.messages.filter(m => m.type !== "typing")
        this.renderMessages()

        const duesPayload = data.data || data
        if (response.ok && (data.status === "success" || duesPayload.owner_name || duesPayload.due_amount || duesPayload.payable_amount || duesPayload.total_payable)) {
          this.renderDuesCard(duesPayload)
        } else {
          const defaultErr = isWater
            ? (isMarathi ? "अवैध सर्व्हिस नंबर किंवा ग्राहक आढळला नाही." : "Invalid Service Number or connection not found")
            : (isMarathi ? "अवैध PIN किंवा मालमत्ता आढळली नाही." : "Invalid PIN or Property not found")

          const errorMsg = data.msg || data.message || defaultErr
          this.renderDuesErrorCard(errorMsg)
        }
      } catch (err) {
        console.error("Dues fetch error:", err)
        this.messages = this.messages.filter(m => m.type !== "typing")
        this.renderMessages()
        const errorMsg = isMarathi ? "सर्व्हरशी संपर्क साधता आला नाही." : "Unable to connect to server."
        this.renderDuesErrorCard(errorMsg)
      }
    },

    renderDuesCard: function (data) {
      const isMarathi = this.currentLanguage === "marathi"
      const isWater = this.selectedDuesType === "water"
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      const cardDiv = document.createElement("div")
      cardDiv.className = "dues-card"

      const ownerLabel = isMarathi ? "मालकाचे नाव" : "Owner Name"
      const pinLabel = isWater 
        ? (isMarathi ? "सर्व्हिस नंबर" : "Service No")
        : (isMarathi ? "PIN क्रमांक" : "PIN")
      const addressLabel = isMarathi ? "पत्ता" : "Address"
      const amountLabel = isMarathi ? "देय रक्कम" : "Total Due Amount"
      const payNowLabel = isMarathi ? "आता भरणा करा (Pay Now)" : "Pay Now"
      // All values below come from an upstream API (untrusted) — escape before
      // injecting into innerHTML to prevent XSS.
      const esc = (v) => this.escapeHtml(v)
      const totalPayable = esc(data.payable_amount || data.total_payable || data.due_amount || data.net_payable || "0.00")
      const ownerName = esc(data.owner_name || 'N/A')
      const refNo = esc(data.service_no || data.serviceno || data.pin || this.storedPin || '')
      const address = data.property_address ? esc(data.property_address) : ''
      // Only allow https payment links; fall back to no link otherwise.
      const paymentLink = this.sanitizeUrl(data.payment_link || '') || '#'
      cardDiv.innerHTML = `
        <div class="dues-card-title">${isMarathi ? "देय तपशील (Dues Details)" : "Dues Details"}</div>
        <div class="dues-card-row"><strong>${ownerLabel}:</strong> <span>${ownerName}</span></div>
        <div class="dues-card-row"><strong>${pinLabel}:</strong> <span>${refNo}</span></div>
        ${address ? `<div class="dues-card-row"><strong>${addressLabel}:</strong> <span>${address}</span></div>` : ''}
        <div class="dues-card-row" style="margin-top: 6px; font-weight: bold; color: #b91c1c;">
          <strong>${amountLabel}:</strong> <span>₹${totalPayable}</span>
        </div>
        <a href="${paymentLink}" target="_blank" rel="noopener noreferrer" class="dues-pay-btn">${payNowLabel}</a>
      `

      messagesContainer.appendChild(cardDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    },

    renderDuesErrorCard: function (errorMsg) {
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      const errorDiv = document.createElement("div")
      errorDiv.className = "dues-error-card"
      errorDiv.textContent = errorMsg
      messagesContainer.appendChild(errorDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    },

    showSecondMenus: function () {
      const lang = this.MENU_STRUCTURE[this.currentLanguage]
      const topKey = this.currentTopCategory

      const block = lang[topKey]

      if (!block || !block.menus || block.menus.length === 0) {
        this.currentLevel = "top_category"
        this.currentMenuContext = null
        this.currentTopCategory = null
        this.showTopCategories()
        return
      }

      this.addMessageToHistory(block.title)
      const buttons = block.menus.map((m) => ({
        label: m.label,
        action: "menu",
        top: topKey,
        menuQuery: m.query,
      }))
      buttons.push(
        { label: lang.back_main, action: "back_to_top" }, 
        { label: lang.other_option, action: "other" },
        { label: lang.start_over, action: "start_over" }
      )
      this.addButtonsToHistory(buttons)
      this.updateInputState()
    },

    showSubmenus: function (menuQuery) {
      const lang = this.MENU_STRUCTURE[this.currentLanguage]
      const topKey = this.currentTopCategory
      const block = lang[topKey]
      const menu = block.menus.find((m) => m.query === menuQuery)
      if (!menu) return

      this.currentMenuContext = menu
      const header =
        this.currentLanguage === "marathi"
          ? `निवडले: ${menu.label}\nकृपया उप-श्रेणी निवडा:`
          : `${menu.label} selected.\nPlease choose a sub-category:`
      this.addMessageToHistory(header)

      const buttons = menu.submenus.map((s) => ({
        label: s.label,
        action: "submenu",
        top: topKey,
        menuQuery: menu.query,
        subQuery: s.query,
      }))
      buttons.push(
        { label: lang.back_prev, action: "back_to_second" },
        { label: lang.back_main, action: "back_to_top" },
        { label: lang.other_option, action: "other" },
        { label: lang.start_over, action: "start_over" }
      )
      this.addButtonsToHistory(buttons)
      this.updateInputState()
    },

    toggleAccordion: function (buttonElement, text) {
      let next = buttonElement.nextElementSibling;
      if (next && next.classList.contains('ai-chatbot-accordion-reply')) {
        next.remove();
        buttonElement.style.borderBottomLeftRadius = "";
        buttonElement.style.borderBottomRightRadius = "";
        return;
      }
      
      const container = buttonElement.parentElement;
      if (container) {
        const openAccordions = container.querySelectorAll('.ai-chatbot-accordion-reply');
        openAccordions.forEach(acc => {
          const prevBtn = acc.previousElementSibling;
          if (prevBtn) {
            prevBtn.style.borderBottomLeftRadius = "";
            prevBtn.style.borderBottomRightRadius = "";
          }
          acc.remove();
        });
      }

      buttonElement.style.borderBottomLeftRadius = "0";
      buttonElement.style.borderBottomRightRadius = "0";

      const replyDiv = document.createElement("div");
      replyDiv.className = "ai-chatbot-accordion-reply";
      
      // Only treat text as HTML if it contains ONLY markup we generated
      // ourselves (the link-box button). Everything else is escaped+linkified.
      const isTrustedMarkup = /^<div style="margin: 8px 0; display: block;"><a href="https:\/\//.test(text);
      if (isTrustedMarkup) {
        replyDiv.innerHTML = text;
      } else {
        replyDiv.innerHTML = this.linkify(text)
          .replace(/\n\n/g, "<br><br>")
          .replace(/\n/g, "<br>")
          .replace(/(?:^|\n)- (.*?)(?=\n|$)/g, "<br>&bull; $1");
      }

      buttonElement.parentNode.insertBefore(replyDiv, buttonElement.nextSibling);
      replyDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },

    handleButtonClick: async function (buttonElement) {
      const action = buttonElement.dataset.action
      const value = buttonElement.dataset.value
      const label = buttonElement.textContent
      const top = buttonElement.dataset.top
      const menuQuery = buttonElement.dataset.menuQuery
      const subQuery = buttonElement.dataset.subQuery

      if (action === "dues_type") {
        this.selectedDuesType = value
        this.addMessageToHistory(label, true)
        this.showPinForm(buttonElement)
        return
      }

      if (action === "submenu") {
        const staticReply = this.getStaticResponse(subQuery, menuQuery, subQuery)
        this.toggleAccordion(buttonElement, staticReply)
        return
      }

      if (action === "top") {
        if (top === "dues") {
          this.showDuesCategorySelection()
          return
        }

        if (top === "rti" || top === "grievance" || top === "contact" || top === "election") {
          const block = this.MENU_STRUCTURE[this.currentLanguage][top]
          if (block?.directReply) {
            this.toggleAccordion(buttonElement, block.directReply)
            return
          }
        }
        
        this.addMessageToHistory(label, true)
        this.currentTopCategory = top
        this.currentLevel = "second_menu"
        this.currentMenuContext = null
        this.showSecondMenus()
        return
      }

      if (action === "menu") {
        const lang = this.MENU_STRUCTURE[this.currentLanguage]
        const topKey = this.currentTopCategory
        const block = lang?.[topKey]
        const menu = block?.menus?.find((m) => m.query === menuQuery)

        if (menu && (!menu.submenus || menu.submenus.length === 0)) {
          if (menu.reply) {
            this.toggleAccordion(buttonElement, menu.reply)
          } else {
            this.toggleAccordion(buttonElement, "Information will appear here.")
          }
          return
        }

        this.addMessageToHistory(label, true)
        this.currentLevel = "submenu"
        this.showSubmenus(menuQuery)
        return
      }

      if (!["back_to_top", "back_to_second"].includes(action)) {
        this.addMessageToHistory(label, true)
      }

      if (action === "language") {
        this.currentLanguage = value
        this.currentLevel = "top_category"
        const lang = this.MENU_STRUCTURE[this.currentLanguage]
        this.addMessageToHistory(lang.welcome)
        if (this.recognition) this.recognition.lang = this.getCurrentLangCode()
        if (this.ttsSupported) {
          const wanted = this.getCurrentLangCode()
          this.selectedVoice = this.pickVoiceFor(wanted, window.speechSynthesis.getVoices())
        }
        this.showTopCategories()
        return
      }

      if (action === "other") {
        this.currentLevel = "free_text"
        this.addMessageToHistory(
          this.currentLanguage === "marathi" ? "कृपया तुमचा प्रश्न टाइप करा." : "Please type your question.",
        )
        this.updateInputState()
        return
      }

      if (action === "back_to_top") {
        this.currentLevel = "top_category"
        this.currentMenuContext = null
        this.showTopCategories()
        return
      }

      if (action === "back_to_second") {
        this.currentLevel = "second_menu"
        this.currentMenuContext = null
        this.showSecondMenus()
        return
      }

      if (action === "start_over") {
        this.resetChat()
        return
      }
    },

    async sendMessage(message = null, isMenuItem = false) {
      const input = document.getElementById("ai-chatbot-input")
      const sendBtn = document.getElementById("ai-chatbot-send")
      const messageToSend = message || input.value.trim()
      if (!messageToSend) return

      if (!isMenuItem) {
        this.addMessageToHistory(messageToSend, true)
      }

      input.value = ""
      sendBtn.disabled = true
      this.autoResize(input)

      if (this.currentLevel === "free_text") {
        this.addMessageToHistory("typing...", false, "typing")
        
        try {
          const response = await fetch(this.buildApiUrl("/api/chat/"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
              message: messageToSend,
              language: this.currentLanguage 
            })
          })

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          
          const data = await response.json()
          
          this.messages = this.messages.filter(m => m.type !== "typing")

          const extractedReply = data.response || data.reply || data.message || (data.data && (data.data.response || data.data.reply || data.data.message))
          if (data && extractedReply) {
            this.addMessageToHistory(extractedReply)
          } else {
            this.addMessageToHistory(
              this.currentLanguage === "marathi" 
                ? "सर्व्हरकडून कोणताही प्रतिसाद मिळाला नाही." 
                : "Received an empty response from the server."
            )
          }
        } catch (error) {
          console.error("API Chat Error:", error)
          this.messages = this.messages.filter(m => m.type !== "typing")
          this.addMessageToHistory(
            this.currentLanguage === "marathi"
              ? "क्षमस्व, सध्या सर्व्हरशी संपर्क साधता येत नाही."
              : "Sorry, I am currently unable to connect to the server."
          )
        }
      } else {
        const staticReply = this.getStaticResponse(messageToSend)
        this.addMessageToHistory(staticReply)
      }

      this.updateInputState()
    },

    getCurrentLangCode: function () {
      if (this.currentLanguage === "marathi") return "mr-IN"
      return "en-IN"
    },

    initVoice: function () {
      this.ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window
      if (this.ttsSupported) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices()
          this.selectedVoice = this.pickVoiceFor(this.getCurrentLangCode(), voices)
        }
        window.speechSynthesis.onvoiceschanged = () => loadVoices()
        loadVoices()
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.sttSupported = true
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.maxAlternatives = 1
        this.recognition.lang = this.getCurrentLangCode()

        this.recognition.onstart = () => {
          this.isListening = true
          const micBtn = document.getElementById("ai-chatbot-mic")
          if (micBtn) micBtn.classList.add("listening")
        }
        this.recognition.onend = () => {
          this.isListening = false
          const micBtn = document.getElementById("ai-chatbot-mic")
          if (micBtn) micBtn.classList.remove("listening")
        }
        this.recognition.onerror = (e) => {
          console.error("STT error:", e)
          this.isListening = false
          const micBtn = document.getElementById("ai-chatbot-mic")
          if (micBtn) micBtn.classList.remove("listening")
          if (e.error !== "no-speech") {
            this.addMessageToHistory(
              this.currentLanguage === "marathi"
                ? "आवाज कॅप्चर करण्यात समस्या आली."
                : "There was a problem capturing your voice.",
            )
          }
        }
        this.recognition.onresult = (event) => {
          try {
            const transcript = (event.results?.[0]?.[0]?.transcript || "").trim()
            if (transcript) {
              this.addMessageToHistory(transcript, true)
              this.sendMessage(transcript, true)
            }
          } catch (err) {
            console.error("STT parse error:", err)
          }
        }
      } else {
        this.sttSupported = false
        const micBtn = document.getElementById("ai-chatbot-mic")
        if (micBtn) {
          micBtn.disabled = true
          micBtn.title = this.currentLanguage === "marathi" ? "आवाज इनपुट उपलब्ध नाही" : "Voice input not available"
        }
      }
    },

    pickVoiceFor: (lang, voices) => {
      if (!voices || !voices.length) return null
      const exact = voices.find((v) => v.lang?.toLowerCase() === lang.toLowerCase())
      if (exact) return exact
      const base = lang.split("-")[0].toLowerCase()
      const sameBase = voices.find((v) => v.lang?.toLowerCase().startsWith(base))
      if (sameBase) return sameBase
      const google = voices.find((v) => v.name?.toLowerCase().includes("google"))
      return google || voices[0]
    },

    startListening: async function () {
      try {
        if (!this.recognition) return
        this.recognition.lang = this.getCurrentLangCode()

        if (this.ttsSupported && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel()
        }

        this.recognition.start()
      } catch (err) {
        console.error("Failed to start STT:", err)
        this.addMessageToHistory(
          this.currentLanguage === "marathi" ? "मायक्रोफोन सुरू करता आला नाही." : "Could not start the microphone.",
        )
      }
    },

    stopListening: function () {
      try {
        if (!this.recognition) return
        this.recognition.stop()
      } catch (err) {
        console.error("Failed to stop STT:", err)
      }
    },
  }

  window.AIChatbot = AIChatbot
})()