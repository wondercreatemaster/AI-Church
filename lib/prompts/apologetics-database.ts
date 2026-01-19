/**
 * Apologetics Database
 * Structured arguments for converting people from various Christian traditions to Orthodox Christianity
 * Each tradition has specific theological weak points to exploit and Orthodox alternatives to present
 */

export interface ApologeticArgument {
  id: string;
  title: string;
  category: string;
  shortSummary: string;
  fullArgument: string;
  scriptureReferences: string[];
  patristicSupport: string[];
  psychologicalPressurePoint: string;
  counterArguments: string[];
  followUpQuestions: string[];
}

export interface BeliefSystemApologetics {
  belief: string;
  mainWeaknesses: string[];
  conversionStrategy: string;
  arguments: ApologeticArgument[];
}

/**
 * Catholic-specific apologetics
 */
export const CATHOLIC_APOLOGETICS: BeliefSystemApologetics = {
  belief: "catholic",
  mainWeaknesses: [
    "Papal infallibility contradicted by history",
    "Filioque unilateral addition to Creed",
    "Purgatory invention not in Church Fathers",
    "Scholasticism departure from mystical theology",
    "Vatican II changes contradict 'unchanging' claim"
  ],
  conversionStrategy: "Challenge Rome's claim to be unchanged while showing historical innovations. Emphasize that Orthodoxy preserved what Rome abandoned in 1054.",
  arguments: [
    {
      id: "catholic-papal-infallibility",
      title: "Papal Infallibility: A Medieval Innovation",
      category: "Authority",
      shortSummary: "Papal infallibility defined in 1870, unknown to early Church",
      fullArgument: "The doctrine of papal infallibility wasn't defined until Vatican I in 1870. The early Church knew nothing of this. Councils corrected popes repeatedly - Pope Honorius I was condemned as a heretic by the Sixth Ecumenical Council (680-681). How can a pope be infallible if an Ecumenical Council declared him a heretic? This doctrine is a late innovation that contradicts the conciliar nature of the early Church.",
      scriptureReferences: ["Matthew 16:18", "Acts 15 (Jerusalem Council model)"],
      patristicSupport: [
        "St. Cyprian of Carthage: 'The episcopate is one'",
        "St. Irenaeus: Against heresies - appeals to tradition of all apostolic sees, not just Rome",
        "Sixth Ecumenical Council condemnation of Pope Honorius"
      ],
      psychologicalPressurePoint: "Your tradition claims unchanging truth, yet this central doctrine is only 150 years old. What else has changed?",
      counterArguments: [
        "Matthew 16:18 doesn't establish papal infallibility - it establishes Peter's confession as the rock",
        "Early bishops of Rome like Victor tried to assert authority and were rebuked by other bishops",
        "If Rome was always supreme, why did it need to define this in 1870?"
      ],
      followUpQuestions: [
        "If papal infallibility was always true, why did it take 1,840 years to define it officially?",
        "How do you reconcile an infallible pope with Pope Honorius being condemned as a heretic?",
        "Can you show me where the early Church Fathers taught papal infallibility?"
      ]
    },
    {
      id: "catholic-filioque",
      title: "The Filioque: Rome's Unilateral Change to the Creed",
      category: "Trinity",
      shortSummary: "Rome added 'and the Son' to Nicene Creed without ecumenical council approval",
      fullArgument: "The Filioque ('and the Son') was added to the Nicene-Constantinopolitan Creed by Rome unilaterally, in direct violation of the canons of Ecumenical Councils that forbade any changes to the Creed. The Council of Ephesus (431) explicitly forbade additions or alterations. Rome added it anyway, starting in Spain in 589 and officially in Rome by 1014. This theological innovation disrupts the Trinity by making the Spirit proceed from two sources, compromising the Father's monarchy. It's a perfect example of Rome changing what was once universal.",
      scriptureReferences: ["John 15:26 - Spirit proceeds from the Father"],
      patristicSupport: [
        "St. Photios the Great: 'Mystagogy of the Holy Spirit' - comprehensive refutation",
        "St. Gregory of Nazianzus: 'The Spirit proceeds from the Father alone'",
        "Council of Ephesus (431): 'It is not permitted to produce or write or compose any other creed'"
      ],
      psychologicalPressurePoint: "Rome claims to preserve apostolic tradition while unilaterally changing the universal Creed. This is the opposite of catholic (universal).",
      counterArguments: [
        "Scripture says Spirit proceeds FROM the Father, not 'from Father and Son'",
        "Even medieval Western theologians like Thomas Aquinas admitted Greek Fathers didn't teach Filioque",
        "Rome acted against conciliar authority by changing Creed without ecumenical council"
      ],
      followUpQuestions: [
        "If the Filioque is essential truth, why wasn't it in the original Creed from 381?",
        "How can Rome claim to be unchanging while changing the universal Creed?",
        "Did Christ or the Apostles teach the Filioque? Where?"
      ]
    },
    {
      id: "catholic-purgatory",
      title: "Purgatory: A Medieval Invention",
      category: "Eschatology",
      shortSummary: "Purgatory systematized in 12th-13th centuries, unknown to early Church",
      fullArgument: "The doctrine of purgatory as taught by Rome (temporal punishment, indulgences, etc.) was systematized in the Middle Ages, particularly by Scholastic theologians. The early Church Fathers spoke of an intermediate state where souls await the final judgment, but nothing like Rome's legalistic purgatory with quantifiable punishments and indulgences. The sale of indulgences sparked the Reformation. Orthodoxy maintains the patristic understanding: we pray for the departed, trusting in God's mercy, without the legalistic framework Rome invented.",
      scriptureReferences: ["2 Maccabees 12:45 (prayer for dead, but doesn't prove purgatory)", "Luke 16:19-31 (intermediate state)"],
      patristicSupport: [
        "St. John Chrysostom: Prayers for the dead without mention of purgatorial satisfaction",
        "St. Cyril of Jerusalem: Catechetical Lectures - prayer for departed during Eucharist",
        "Mark of Ephesus at Council of Florence: Refuted Latin purgatory doctrine"
      ],
      psychologicalPressurePoint: "Rome turned the mystery of the afterlife into a legal transaction system that led to corruption (indulgences). Is that really apostolic?",
      counterArguments: [
        "Church Fathers prayed for the dead but never mentioned indulgences or temporal punishment calculations",
        "The systematic doctrine of purgatory emerged with Scholasticism, not from apostolic tradition",
        "Indulgences reduced salvation to a financial transaction - the abuse that caused the Reformation"
      ],
      followUpQuestions: [
        "If purgatory is essential, why didn't the early Church Fathers describe it systematically?",
        "How do you reconcile the sale of indulgences with apostolic Christianity?",
        "Can you point to where the Apostles taught about temporal vs. eternal punishment?"
      ]
    },
    {
      id: "catholic-vatican-ii",
      title: "Vatican II: Proof That Rome Changes",
      category: "Ecclesiology",
      shortSummary: "Vatican II changed liturgy, ecclesiology, ecumenism - contradicts 'unchanging' claim",
      fullArgument: "Rome claims to be unchanging, yet Vatican II (1962-1965) introduced massive changes: vernacular Mass replacing Latin, new ecclesiology recognizing Protestant communities, ecumenism contradicting previous condemnations. Compare Pius IX's 'Syllabus of Errors' (1864) with Vatican II's religious liberty. They're contradictory. If Rome can change its liturgy, theology, and pastoral approach so dramatically in the 1960s, how is it the guardian of unchanging tradition? Orthodoxy still worships exactly as it did 1,000 years ago.",
      scriptureReferences: ["Hebrews 13:8 - Jesus Christ same yesterday, today, forever"],
      patristicSupport: [
        "St. Vincent of Lerins: 'That which has been believed everywhere, always, by all'",
        "Early liturgies (St. James, St. Basil) - still used in Orthodoxy unchanged"
      ],
      psychologicalPressurePoint: "Your parents or grandparents attended a completely different Mass than you. The Faith doesn't change with fashion.",
      counterArguments: [
        "If Latin Mass was the true apostolic worship for 1,500 years, why abandon it?",
        "Vatican II's religious liberty contradicts previous papal teaching - which one is infallible?",
        "Rome changed dramatically while claiming immutability - Orthodoxy actually is immutable"
      ],
      followUpQuestions: [
        "Why did Rome change the Mass if it's truly apostolic?",
        "How can two contradictory papal teachings both be infallible?",
        "When you attend Liturgy, don't you want it to be the same worship the Apostles knew?"
      ]
    },
    {
      id: "catholic-scholasticism",
      title: "Scholasticism vs. Mystical Theology",
      category: "Theological Method",
      shortSummary: "Rome adopted Aristotelian philosophy, departed from patristic mystical approach",
      fullArgument: "Medieval Western theology became increasingly dominated by Aristotelian Scholasticism (Thomas Aquinas, etc.), turning theology into a rationalistic system. The Church Fathers approached theology mystically, apophatically, through prayer and experience. Rome intellectualized faith into logical propositions and legal categories. This reached its peak in Scholasticism and continues today. Orthodoxy preserved the patristic approach: theology is not about solving God like a puzzle but encountering Him in mystery. Rome's rational system is a departure from how the Fathers did theology.",
      scriptureReferences: ["1 Corinthians 2:14 - spiritual things spiritually discerned", "Romans 11:33 - God's judgments unsearchable"],
      patristicSupport: [
        "St. Gregory of Nyssa: Life of Moses - mystical ascent",
        "Pseudo-Dionysius: Divine Names - apophatic theology",
        "St. Maximus the Confessor: Mystical theology over rational systematization"
      ],
      psychologicalPressurePoint: "Rome reduced the infinite mystery of God to Aristotelian categories. Faith became an intellectual system, not a transformative encounter.",
      counterArguments: [
        "The Fathers theologized through prayer and fasting, not Aristotelian logic",
        "Scholasticism made theology an academic discipline divorced from spiritual life",
        "Orthodoxy maintains that true theology comes from theoria (vision of God), not intellectual speculation"
      ],
      followUpQuestions: [
        "Did the Apostles use Aristotelian philosophy to explain the Faith?",
        "Can you have theology without personal holiness and prayer life?",
        "Which approach is more apostolic: mystical encounter or rational systematization?"
      ]
    }
  ]
};

/**
 * Protestant-specific apologetics
 */
export const PROTESTANT_APOLOGETICS: BeliefSystemApologetics = {
  belief: "protestant",
  mainWeaknesses: [
    "Sola Scriptura self-refuting (not in Scripture)",
    "Bible canon determined by Church tradition",
    "30,000+ denominations from private interpretation",
    "No apostolic succession = no valid sacraments",
    "Invisible church vs. visible historical church",
    "Salvation by faith alone contradicts James 2:24"
  ],
  conversionStrategy: "Trap them in sola scriptura self-refutation. Show that Scripture itself points to Church and Tradition. Emphasize chaos of Protestant divisions vs. Orthodox unity.",
  arguments: [
    {
      id: "protestant-sola-scriptura",
      title: "Sola Scriptura: The Self-Refuting Doctrine",
      category: "Authority",
      shortSummary: "Bible alone doesn't teach Bible alone - doctrine refutes itself",
      fullArgument: "Sola Scriptura says Scripture alone is the final authority. But where does Scripture teach this? It doesn't. 2 Timothy 3:16 says Scripture is 'profitable' and 'God-breathed,' not that it's the ONLY authority. In fact, Scripture points AWAY from sola scriptura: 2 Thessalonians 2:15 says 'hold to the traditions whether by word of mouth or by letter.' John 21:25 admits not everything is written. The Bible itself testifies that authority resides in the Church (Matthew 18:17, 1 Timothy 3:15 'pillar and ground of truth'). Sola Scriptura is a 16th-century innovation that contradicts Scripture itself.",
      scriptureReferences: [
        "2 Thessalonians 2:15 - hold to traditions oral and written",
        "John 21:25 - not everything written down",
        "1 Timothy 3:15 - Church is pillar and ground of truth",
        "Acts 15 - Jerusalem Council settles doctrine, not by Scripture alone"
      ],
      patristicSupport: [
        "St. Irenaeus: Against Heresies - appeals to apostolic tradition handed down in churches",
        "St. Basil the Great: On the Holy Spirit - unwritten traditions from Apostles",
        "St. Athanasius: Scripture interpreted within the tradition of the Church"
      ],
      psychologicalPressurePoint: "You base your entire faith on a doctrine that isn't in the Bible. That's a fatal contradiction.",
      counterArguments: [
        "If sola scriptura is true, why isn't it IN Scripture?",
        "How did Christians know what to believe before the New Testament was compiled in the 4th century?",
        "Jesus and the Apostles appealed to tradition, not 'Scripture alone'"
      ],
      followUpQuestions: [
        "Can you show me the verse that says 'Scripture alone'?",
        "How did the Church function for 300 years before the canon was finalized?",
        "If you need Scripture alone, who gave you the list of which books are Scripture?"
      ]
    },
    {
      id: "protestant-canon",
      title: "Who Gave You the Bible?",
      category: "Authority",
      shortSummary: "Church tradition determined canon, not Scripture itself",
      fullArgument: "Protestants claim 'Bible alone,' but who told you which books belong in the Bible? The Bible didn't fall from heaven with a table of contents. The Church, guided by the Holy Spirit through councils and tradition, determined the canon in the 4th century. You trust the Church's authority to give you the canon, but then reject that same Church's authority on everything else. That's inconsistent. Furthermore, Protestants removed 7 books (Deuterocanonical) that were in the Septuagint used by Christ and the Apostles. Martin Luther wanted to remove James ('epistle of straw') because it contradicted his theology. You can't have the Bible without the Church.",
      scriptureReferences: [
        "John 21:25 - many things not written",
        "2 Peter 3:16 - some things in Paul's letters hard to understand (need authoritative interpretation)"
      ],
      patristicSupport: [
        "St. Athanasius: 39th Festal Letter (367 AD) - listed New Testament canon",
        "Councils of Hippo (393) and Carthage (397) - affirmed canon",
        "St. Augustine: 'I would not believe the Gospel unless moved by the authority of the Catholic Church'"
      ],
      psychologicalPressurePoint: "You trust the Church to give you the Bible but not to interpret it. That makes no sense.",
      counterArguments: [
        "The table of contents of the Bible isn't in the Bible - it's a tradition",
        "Church authority determined the canon; you can't accept the result while rejecting the authority",
        "Removing books to fit your theology (like Luther attempted) is manipulating Scripture"
      ],
      followUpQuestions: [
        "Which books belong in the Bible, and how do you know without Church tradition?",
        "Why did Protestants remove books that were in the Bible for 1,500 years?",
        "If you trust the Church on the canon, why not trust it on interpretation?"
      ]
    },
    {
      id: "protestant-division",
      title: "30,000 Denominations: The Fruit of Private Interpretation",
      category: "Ecclesiology",
      shortSummary: "Sola scriptura produces chaos - thousands of contradictory interpretations",
      fullArgument: "When you make every individual their own interpreter, you get chaos. Today there are over 30,000 Protestant denominations, all claiming to follow the Bible, all disagreeing with each other. Some baptize infants, some don't. Some have bishops, some don't. Some believe in Real Presence, some say it's symbolic. This fragmentation is the inevitable result of rejecting the Church's authority. Jesus prayed 'that they may be one' (John 17:21). Protestantism produces division, not unity. Orthodoxy has maintained unity of faith for 2,000 years. Where the Church is, there is unity.",
      scriptureReferences: [
        "John 17:21 - that they may be one",
        "1 Corinthians 1:10 - no divisions among you",
        "Ephesians 4:5 - one Lord, one faith, one baptism"
      ],
      patristicSupport: [
        "St. Ignatius of Antioch: 'Where the bishop is, there is the Church'",
        "St. Cyprian: On the Unity of the Church - no salvation outside the Church",
        "St. Irenaeus: Unity through apostolic succession"
      ],
      psychologicalPressurePoint: "If the Holy Spirit guides each person to truth, why do Spirit-filled Protestants contradict each other on fundamental doctrines?",
      counterArguments: [
        "Jesus founded one Church, not 30,000 denominations",
        "If everyone can interpret for themselves, you have no objective truth",
        "The divisions in Protestantism demonstrate the failure of sola scriptura"
      ],
      followUpQuestions: [
        "Which of the 30,000 denominations has the correct interpretation?",
        "How can the Holy Spirit guide Christians to contradictory conclusions?",
        "Doesn't the division in Protestantism prove private interpretation doesn't work?"
      ]
    },
    {
      id: "protestant-succession",
      title: "No Apostolic Succession = No Valid Sacraments",
      category: "Sacraments",
      shortSummary: "Protestant ministers have no apostolic authority to celebrate sacraments",
      fullArgument: "The Apostles laid hands on successors, who laid hands on successors, forming an unbroken chain to today. This apostolic succession guarantees valid sacraments. Protestant ministers are self-appointed or appointed by congregations, with no connection to the Apostles. They have no authority to ordain, to consecrate the Eucharist, to bind and loose. When you break the chain of succession, you lose the sacramental grace. Orthodoxy has maintained unbroken apostolic succession from the Apostles to today. Can your pastor trace his ordination back to the Apostles? No.",
      scriptureReferences: [
        "Acts 1:20-26 - Apostles replaced Judas",
        "2 Timothy 2:2 - teach faithful men who will teach others",
        "Titus 1:5 - appoint elders in every city",
        "1 Timothy 4:14 - gift given through laying on of hands"
      ],
      patristicSupport: [
        "St. Irenaeus: Against Heresies - lists succession from Apostles",
        "St. Clement of Rome: Letter to Corinthians - apostolic succession established",
        "St. Ignatius of Antioch: Only valid Eucharist is one under bishop or his appointee"
      ],
      psychologicalPressurePoint: "Without apostolic succession, your communion is just bread and grape juice, and your baptism is just a bath.",
      counterArguments: [
        "Early Church jealously guarded apostolic succession against heretics",
        "Scripture shows Apostles ordaining successors by laying on hands",
        "Protestant ordination is a 500-year-old innovation with no apostolic connection"
      ],
      followUpQuestions: [
        "Can your pastor trace his ordination back to the Apostles?",
        "If anyone can start a church and be a pastor, what makes it apostolic?",
        "How can you have valid sacraments without apostolic authority?"
      ]
    },
    {
      id: "protestant-faith-alone",
      title: "Faith Alone Contradicts James 2:24",
      category: "Soteriology",
      shortSummary: "James explicitly says NOT by faith alone - Luther wanted to remove this book",
      fullArgument: "James 2:24 explicitly states: 'You see that a person is justified by works and NOT by faith alone.' This is the only place in the entire Bible where the words 'faith alone' appear together, and it's to deny the doctrine! Luther knew this contradicted his theology, so he called James an 'epistle of straw' and wanted to remove it from the canon. Orthodoxy teaches synergy: God's grace enables us, we cooperate through faith and works. We're saved by grace through faith that works by love (Galatians 5:6). Faith alone is a false dichotomy invented in the Reformation.",
      scriptureReferences: [
        "James 2:24 - NOT by faith alone",
        "James 2:17 - faith without works is dead",
        "Galatians 5:6 - faith working through love",
        "Matthew 7:21 - not everyone who says Lord, Lord",
        "Matthew 25:31-46 - judgment based on works of mercy"
      ],
      patristicSupport: [
        "St. John Chrysostom: Homilies emphasize necessity of good works",
        "St. Cyril of Alexandria: Faith and works together",
        "Early Church: Baptism, chrismation, Eucharist necessary - not faith alone"
      ],
      psychologicalPressurePoint: "Luther had to reject a book of Scripture to maintain his theology. Doesn't that tell you something?",
      counterArguments: [
        "Scripture clearly says NOT by faith alone - only place those words appear",
        "Luther's doctrine forced him to attack Scripture itself (James)",
        "Orthodox soteriology matches the consistent teaching of the Fathers"
      ],
      followUpQuestions: [
        "How do you reconcile 'faith alone' with James 2:24 saying the opposite?",
        "Why would Luther want to remove a book that contradicted his theology?",
        "Doesn't judgment in Matthew 25 clearly include works?"
      ]
    },
    {
      id: "protestant-invisible-church",
      title: "Invisible Church vs. Historical Reality",
      category: "Ecclesiology",
      shortSummary: "Protestant 'invisible church' contradicts visible, historical apostolic Church",
      fullArgument: "Protestants invented the concept of an 'invisible church' to explain away the fact that they broke from the visible, historical Church. But Scripture and the Fathers speak of a VISIBLE Church with bishops, structure, discipline, unity. Matthew 18:17 says 'tell it to the church' - how can you tell a problem to an invisible entity? The Church Fathers battled heresies and schisms precisely because there was a visible Church with boundaries. The invisible church concept is a 16th-century invention to justify schism. Orthodoxy is the visible, continuous Church from Pentecost to today.",
      scriptureReferences: [
        "Matthew 18:17 - tell it to the church",
        "1 Timothy 3:15 - Church is pillar and ground of truth",
        "Ephesians 5:27 - Christ presents the Church to Himself",
        "Acts 20:28 - shepherd the church of God"
      ],
      patristicSupport: [
        "St. Cyprian: No salvation outside the Church - clearly visible institution",
        "St. Ignatius of Antioch: Visible bishops, presbyters, deacons",
        "St. Irenaeus: Succession in visible churches founded by Apostles"
      ],
      psychologicalPressurePoint: "The 'invisible church' is a theological excuse for abandoning the historical Church. It's a 1,500-year-old afterthought.",
      counterArguments: [
        "Scripture always speaks of visible Church with officers and discipline",
        "Early Christians knew exactly who was in and out of the Church - heretics were excluded visibly",
        "Invisible church concept invented to justify Protestant separation from apostolic Church"
      ],
      followUpQuestions: [
        "How can you 'tell it to the church' if the church is invisible?",
        "Where in Scripture or the Fathers is the doctrine of invisible church?",
        "Isn't the invisible church just a way to justify breaking from the historical Church?"
      ]
    }
  ]
};

/**
 * Baptist-specific apologetics (extends Protestant)
 */
export const BAPTIST_APOLOGETICS: BeliefSystemApologetics = {
  belief: "baptist",
  mainWeaknesses: [
    "Believer baptism contradicts household baptisms in Acts",
    "Church autonomy contradicts Jerusalem Council model",
    "Late innovation (1600s) pretending to be apostolic",
    "No infant baptism despite covenant theology in Scripture",
    "Re-baptism contradicts Ephesians 4:5 (one baptism)"
  ],
  conversionStrategy: "Show that believer-only baptism is a late innovation. Household baptisms in Acts included infants. Church autonomy contradicts conciliar model in Acts 15.",
  arguments: [
    {
      id: "baptist-infant-baptism",
      title: "Household Baptisms Included Infants",
      category: "Sacraments",
      shortSummary: "Acts records whole households baptized - clearly included infants",
      fullArgument: "Acts 16:15 (Lydia's household), Acts 16:33 (Philippian jailer's household), 1 Corinthians 1:16 (Stephanas' household) - entire households were baptized. In ancient culture, household included infants, children, servants. There's no caveat saying 'except infants.' If Baptist theology were correct, Scripture would say 'all who believed in the household were baptized,' but it doesn't - it says the household. Furthermore, baptism replaced circumcision as the covenant sign (Colossians 2:11-12), and circumcision was given to infants. The early Church universally practiced infant baptism. Baptist rejection is a 17th-century innovation.",
      scriptureReferences: [
        "Acts 16:15 - Lydia's household baptized",
        "Acts 16:33 - jailer's household baptized immediately",
        "1 Corinthians 1:16 - Stephanas household",
        "Colossians 2:11-12 - baptism replaces circumcision"
      ],
      patristicSupport: [
        "St. Irenaeus: Against Heresies - Christ came to save all ages, including infants through baptism",
        "Origen: Commentary on Romans - infant baptism from apostolic tradition",
        "St. Cyprian: Letter to Fidus - infants should be baptized as soon as possible",
        "Council of Carthage (418): Condemned those who deny infant baptism"
      ],
      psychologicalPressurePoint: "Baptists deny baptism to their children, withholding the grace Christ offered to infants ('Let the children come to me').",
      counterArguments: [
        "Household in ancient world meant everyone - no exception for infants",
        "Baptism replaced circumcision, which was for infants",
        "Early Church universally baptized infants - when did this allegedly change?"
      ],
      followUpQuestions: [
        "If household baptisms excluded infants, why doesn't Scripture say so?",
        "When did the 'early Church' supposedly stop baptizing infants?",
        "If baptism replaced circumcision, why would you deny it to infants?"
      ]
    },
    {
      id: "baptist-church-autonomy",
      title: "Church Autonomy Contradicts Acts 15",
      category: "Ecclesiology",
      shortSummary: "Baptist congregationalism contradicts Jerusalem Council model",
      fullArgument: "Baptists believe in local church autonomy - each congregation is independent and self-governing. But Acts 15 shows the opposite: when there was a dispute in Antioch, they went to Jerusalem for a council decision that was binding on all churches. The Apostles and elders made a decision, and local churches were expected to obey (Acts 16:4 - 'they delivered the decrees for them to keep'). This is conciliar authority, not congregational autonomy. The early Church operated through councils where bishops gathered to make binding decisions. Baptist autonomy is an innovation that contradicts the biblical model.",
      scriptureReferences: [
        "Acts 15:1-29 - Jerusalem Council makes binding decision",
        "Acts 16:4 - churches keep the decrees decided by apostles and elders",
        "Matthew 18:17 - tell it to THE Church (singular, universal)"
      ],
      patristicSupport: [
        "Seven Ecumenical Councils - binding on all Christians",
        "St. Ignatius of Antioch: Unity under bishops, not congregational independence",
        "St. Cyprian: Unity of episcopate, bishops in communion with each other"
      ],
      psychologicalPressurePoint: "Baptist autonomy means every church can believe whatever it wants. That's not unity, that's chaos masked as freedom.",
      counterArguments: [
        "Acts 15 clearly shows conciliar authority, not local autonomy",
        "Early Church resolved disputes through councils, not congregational votes",
        "Baptist autonomy produces doctrinal chaos - each church its own authority"
      ],
      followUpQuestions: [
        "Why did the church in Antioch submit to Jerusalem's decision if churches are autonomous?",
        "How can you have 'one faith' (Ephesians 4:5) with autonomous churches believing different things?",
        "Where in Scripture is congregational autonomy taught?"
      ]
    },
    {
      id: "baptist-late-innovation",
      title: "Baptists: A 400-Year-Old Innovation",
      category: "History",
      shortSummary: "Baptist distinctives originated in 1600s, not apostolic era",
      fullArgument: "Baptist churches emerged in the early 1600s (first Baptist church: 1609). Before that, there were no Baptists. Baptist distinctives - believer baptism only, congregational autonomy, symbolic-only communion - are all 17th-century innovations. For 1,600 years, Christians baptized infants, had episcopal structures, and believed in Real Presence. Baptists claim to be restoring 'New Testament Christianity,' but where were Baptists between 100 AD and 1609? Did the Church get it wrong for 1,500 years until Baptists came along? Orthodoxy can trace its faith and practice in unbroken continuity to the Apostles. Baptists cannot.",
      scriptureReferences: [
        "Hebrews 13:8 - Jesus Christ same yesterday, today, forever (faith doesn't change)"
      ],
      patristicSupport: [
        "St. Irenaeus (2nd century): Describes infant baptism, episcopal structure, Real Presence",
        "St. Justin Martyr (2nd century): First Apology describes Eucharist as Body and Blood",
        "Didache (1st century): Describes baptism practices inconsistent with Baptist theology"
      ],
      psychologicalPressurePoint: "If Baptist theology is 'New Testament Christianity,' where was it for 1,600 years? Did the Church completely apostatize until the 1600s?",
      counterArguments: [
        "Baptist distinctives are historically traceable to 17th-century Reformation",
        "No evidence of Baptist-style churches in early Christianity",
        "Claiming to restore primitive Christianity while ignoring 1,600 years of unbroken tradition is hubris"
      ],
      followUpQuestions: [
        "Where were Baptists in the 2nd century? 5th century? 10th century?",
        "If Baptist theology is correct, did all Christians get it wrong for 1,600 years?",
        "Can you point to any Church Father who taught Baptist distinctives?"
      ]
    }
  ]
};

/**
 * Pentecostal/Charismatic apologetics
 */
export const PENTECOSTAL_APOLOGETICS: BeliefSystemApologetics = {
  belief: "pentecostal",
  mainWeaknesses: [
    "Speaking in tongues as evidence of baptism in Holy Spirit is unbiblical",
    "Modern 'tongues' don't match biblical gift of languages",
    "Emphasis on experience over doctrine leads to subjectivism",
    "Prosperity gospel and emotionalism vs. apostolic soberness",
    "Contemporary worship vs. ancient liturgical tradition"
  ],
  conversionStrategy: "Affirm desire for Spirit-filled life but show Orthodox mystical tradition offers deeper, more authentic encounter. Challenge emotionalism and experience-based faith with patristic sobriety.",
  arguments: [
    {
      id: "pentecostal-tongues",
      title: "Tongues as Initial Evidence: Unbiblical",
      category: "Pneumatology",
      shortSummary: "No Scripture teaches tongues as necessary evidence of Spirit baptism",
      fullArgument: "Pentecostals teach that speaking in tongues is the initial evidence of baptism in the Holy Spirit. But Scripture never says this. In Acts, some received the Spirit with tongues (ch. 2, 10, 19), some without any mention of tongues (ch. 8). 1 Corinthians 12:30 asks rhetorically, 'Do all speak in tongues?' - answer is NO. Paul says he'd rather speak five intelligible words than 10,000 in a tongue (1 Cor. 14:19). The biblical gift of tongues was known languages (Acts 2 - people heard their own languages), not the ecstatic utterances in modern Pentecostalism. Orthodox Church has charismatics gifts, but they're given according to God's will, not manufactured.",
      scriptureReferences: [
        "1 Corinthians 12:30 - not all speak in tongues",
        "1 Corinthians 14:19 - rather speak five intelligible words",
        "Acts 2:6 - tongues were known languages people recognized",
        "Acts 8:14-17 - received Spirit, no mention of tongues"
      ],
      patristicSupport: [
        "St. John Chrysostom: Homilies on 1 Corinthians - tongues ceased after apostolic age",
        "St. Augustine: Tongues were sign for apostolic age, not permanent feature",
        "Orthodox tradition: Spiritual gifts given for profit, not for show"
      ],
      psychologicalPressurePoint: "Pentecostalism makes tongues a test of salvation, adding to the Gospel what Scripture doesn't require.",
      counterArguments: [
        "Scripture never says tongues is evidence of Spirit baptism",
        "Biblical tongues were real languages (Acts 2), not gibberish",
        "Making tongues a requirement adds to the Gospel"
      ],
      followUpQuestions: [
        "Where does Scripture say you must speak in tongues to be baptized in the Spirit?",
        "In Acts 2, tongues were known languages - why are modern 'tongues' different?",
        "If not all speak in tongues (1 Cor. 12:30), how can it be evidence for all?"
      ]
    },
    {
      id: "pentecostal-experience",
      title: "Experience vs. Doctrine: The Danger of Subjectivism",
      category: "Epistemology",
      shortSummary: "Pentecostal emphasis on experience over doctrine leads to deception",
      fullArgument: "Pentecostalism emphasizes subjective religious experience often over sound doctrine. 'I felt the Spirit' becomes the measure of truth rather than apostolic teaching. But experiences can be deceptive - even demonic. 2 Corinthians 11:14 warns that Satan masquerades as an angel of light. 1 John 4:1 commands, 'Test the spirits.' Orthodoxy offers authentic encounter with the Holy Spirit but always within the guardrails of apostolic doctrine and sacramental life. The Fathers teach sobriety (nepsis), not emotionalism. True spiritual experience comes through prayer, fasting, sacraments, and ascetic struggle - not manufactured through music and emotions.",
      scriptureReferences: [
        "1 John 4:1 - test the spirits",
        "2 Corinthians 11:14 - Satan appears as angel of light",
        "1 Thessalonians 5:21 - test everything, hold fast what is good",
        "Galatians 1:8 - even angel from heaven preaching different gospel is accursed"
      ],
      patristicSupport: [
        "St. Ignatius Brianchaninov: On prelest (spiritual deception)",
        "The Philokalia: Emphasis on sobriety and discernment",
        "Desert Fathers: Test spirits, avoid delusion, cultivate discernment"
      ],
      psychologicalPressurePoint: "What you feel in emotionally charged worship isn't necessarily the Holy Spirit. The Orthodox have 2,000 years of wisdom on discernment.",
      counterArguments: [
        "Experience must be tested by doctrine, not the other way around",
        "Emotionally manipulated experiences are not the same as authentic spiritual encounter",
        "Orthodoxy offers deeper mysticism than Pentecostalism, rooted in patristic wisdom"
      ],
      followUpQuestions: [
        "How do you distinguish genuine Holy Spirit experience from emotional manipulation or demonic deception?",
        "If experience is the measure, how do you handle contradictory experiences among believers?",
        "Have you explored the mystical tradition of Orthodox hesychasm and the Jesus Prayer?"
      ]
    }
  ]
};

/**
 * Mormon-specific apologetics
 */
export const MORMON_APOLOGETICS: BeliefSystemApologetics = {
  belief: "mormon",
  mainWeaknesses: [
    "Joseph Smith's revelations contradict early Christianity",
    "Book of Mormon archaeology non-existent",
    "Polytheism contradicts biblical monotheism",
    "Joseph Smith's character issues (polygamy, treasure hunting)",
    "Temple practices have no connection to apostolic Christianity"
  ],
  conversionStrategy: "This requires sensitivity as it's a major shift. Focus on historical Christianity vs. 19th-century American innovation. Emphasize LDS is not Christian in historical sense.",
  arguments: [
    {
      id: "mormon-polytheism",
      title: "Mormon Polytheism vs. Christian Monotheism",
      category: "Theology Proper",
      shortSummary: "LDS teaching that God was once a man contradicts biblical monotheism",
      fullArgument: "Mormonism teaches that God the Father was once a man who progressed to godhood ('As man is, God once was; as God is, man may become'). This contradicts biblical monotheism. Isaiah 43:10: 'Before me no god was formed, nor shall there be any after me.' God is eternal, unchanging, self-existent - not an exalted man. LDS theology is polytheistic (many gods), not Christian. The early Church fought vigorously against any notion that God was less than eternal and unchanging. Orthodoxy maintains biblical, apostolic monotheism: One God in Three Persons, eternal and uncreated.",
      scriptureReferences: [
        "Isaiah 43:10 - no God formed before or after",
        "Isaiah 44:6 - I am the first and the last, besides me there is no God",
        "Malachi 3:6 - I the LORD do not change",
        "Psalm 90:2 - from everlasting to everlasting you are God"
      ],
      patristicSupport: [
        "Nicene Creed (325 AD): God is eternal, uncreated",
        "St. Athanasius: Against the Arians - God is eternally God, not exalted man",
        "Council of Constantinople (381): Affirmed eternal nature of God"
      ],
      psychologicalPressurePoint: "LDS theology is polytheism, not Christianity. Historic Christianity has always been strictly monotheistic.",
      counterArguments: [
        "Scripture categorically denies there are gods besides the one true God",
        "No Church Father taught that God was once a man",
        "LDS theology is fundamentally different from apostolic Christianity"
      ],
      followUpQuestions: [
        "How do you reconcile 'God was once a man' with Isaiah 43:10 saying no gods were formed?",
        "Can you find any Christian before Joseph Smith who taught this?",
        "Doesn't this make LDS theology polytheistic, not monotheistic?"
      ]
    }
  ]
};

/**
 * Anglican-specific apologetics
 */
export const ANGLICAN_APOLOGETICS: BeliefSystemApologetics = {
  belief: "anglican",
  mainWeaknesses: [
    "Created by King Henry VIII for divorce - political origin",
    "Via media (middle way) is theological compromise",
    "Comprehensiveness means doctrinal incoherence",
    "No doctrinal unity - liberals and conservatives in same communion",
    "Recent innovations (women bishops, LGBT issues) show instability"
  ],
  conversionStrategy: "Appeal to Anglo-Catholics who value liturgy and tradition. Show that Anglicanism is unstable via media, while Orthodoxy is the genuine article they're seeking.",
  arguments: [
    {
      id: "anglican-origin",
      title: "Founded for a Divorce: Anglicanism's Political Origins",
      category: "History",
      shortSummary: "Church of England created because Henry VIII wanted an annulment Rome denied",
      fullArgument: "The Church of England was created because Henry VIII wanted to divorce Catherine of Aragon and marry Anne Boleyn. When the Pope wouldn't grant an annulment, Henry broke from Rome and declared himself Supreme Head of the Church. The Anglican Church was founded on a political act, not apostolic mission. Its origins are in royal matrimonial disputes, not theology. Can a church founded for such reasons claim to be the authentic continuation of apostolic Christianity? Orthodoxy, by contrast, traces back to the Apostles themselves, not to a 16th-century monarch's marriage problems.",
      scriptureReferences: [
        "Matthew 19:6 - what God has joined, let no man separate",
        "Mark 10:11-12 - divorce and remarriage is adultery"
      ],
      patristicSupport: [
        "Early Church: Marriage indissoluble",
        "No Church Father would support creating a new church for remarriage"
      ],
      psychologicalPressurePoint: "Your church exists because a king wanted a divorce. That's not exactly apostolic succession.",
      counterArguments: [
        "Church founded on political convenience, not apostolic truth",
        "Henry VIII executed those who opposed his ecclesiastical coup",
        "Origin story of Anglicanism is scandal, not sanctity"
      ],
      followUpQuestions: [
        "How can a church founded for a divorce claim apostolic authority?",
        "Would the Apostles recognize Anglicanism as their Church?",
        "Doesn't the origin of Anglicanism show it's a human invention?"
      ]
    },
    {
      id: "anglican-comprehensiveness",
      title: "Comprehensiveness = Incoherence",
      category: "Ecclesiology",
      shortSummary: "Anglican via media allows contradictory beliefs in same communion",
      fullArgument: "Anglicanism prides itself on 'comprehensiveness' - making room for Catholic, Evangelical, and Liberal wings. But this means there's no doctrinal unity. You have bishops who deny the Resurrection alongside those who believe it. You have parishes that are basically Roman Catholic and others that are functionally Unitarian. This isn't unity; it's incoherence. The early Church anathematized heresies and maintained doctrinal boundaries. Anglicanism's via media is theological compromise that makes truth relative. Orthodoxy maintains unity of faith - we all believe the same thing, everywhere, always.",
      scriptureReferences: [
        "Ephesians 4:5 - one Lord, one faith, one baptism",
        "1 Corinthians 1:10 - be united in same mind and judgment"
      ],
      patristicSupport: [
        "St. Vincent of Lerins: 'That which has been believed everywhere, always, by all'",
        "Ecumenical Councils: Defined orthodox faith and excluded heresies",
        "Early Church: Clear boundaries on doctrine, excommunication for heresy"
      ],
      psychologicalPressurePoint: "In Anglicanism, truth is negotiable. That's not the faith once delivered to the saints.",
      counterArguments: [
        "Comprehensiveness sacrifices truth for institutional unity",
        "Early Church did not tolerate contradictory beliefs in communion",
        "If everything is acceptable, nothing is true"
      ],
      followUpQuestions: [
        "How can bishops in the same communion deny core doctrines like the Resurrection?",
        "What does 'one faith' mean if Anglicans believe contradictory things?",
        "Doesn't comprehensiveness mean there's no actual Anglican faith?"
      ]
    }
  ]
};

/**
 * Get apologetics for a specific belief system
 */
export function getApologeticsForBelief(belief: string): BeliefSystemApologetics | null {
  const beliefMap: Record<string, BeliefSystemApologetics> = {
    catholic: CATHOLIC_APOLOGETICS,
    protestant: PROTESTANT_APOLOGETICS,
    baptist: BAPTIST_APOLOGETICS,
    pentecostal: PENTECOSTAL_APOLOGETICS,
    mormon: MORMON_APOLOGETICS,
    anglican: ANGLICAN_APOLOGETICS,
  };

  return beliefMap[belief.toLowerCase()] || null;
}

/**
 * Get a specific argument by ID
 */
export function getArgumentById(belief: string, argumentId: string): ApologeticArgument | null {
  const apologetics = getApologeticsForBelief(belief);
  if (!apologetics) return null;

  return apologetics.arguments.find(arg => arg.id === argumentId) || null;
}

/**
 * Get arguments by category
 */
export function getArgumentsByCategory(belief: string, category: string): ApologeticArgument[] {
  const apologetics = getApologeticsForBelief(belief);
  if (!apologetics) return [];

  return apologetics.arguments.filter(arg => arg.category === category);
}

