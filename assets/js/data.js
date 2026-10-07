/* ============================================================
   ДАННЫЕ КОЛЛЕКЦИИ — редактируйте только этот файл.
   ------------------------------------------------------------
   Структура:
   - events[] — одна вкладка на каждый OFFZONE:
       id         — уникальный (латиница/цифры), на него ссылаются
                    аддоны через years
       title      — подпись вкладки
       date, location — строка мета-информации
       group      — НЕОБЯЗАТЕЛЬНО: "offzone" | "other". Без поля
                    решается по id: начинается с "offzone" → блок
                    OFFZONE, иначе → блок «Другое»
       addonOrder — НЕОБЯЗАТЕЛЬНЫЙ массив id аддонов: эти аддоны
                    идут на странице года первыми, в указанном
                    порядке; остальные — дальше, в порядке общего
                    списка addons[]
       badge      — бейдж года:
           name, description, source (ссылка-источник или null),
           photos  — массив путей; первое фото — главное
           model3d — путь к .glb/.gltf или null (включает 3D-просмотр)
   - addons[] — ОБЩИЙ список аддонов всей коллекции. Один аддон —
     одна запись, даже если он был на нескольких конфах:
       id        — уникальный ГЛОБАЛЬНО (латиница/цифры/дефис)
       years     — массив id событий, где аддон встречался,
                   напр. ["offzone-2023", "offzone-2024"]
       name      — название
       category  — "partner" | "soldering" | "community"
                   partner   — партнёрские (компании со стендами)
                   soldering — зона пайки (официальные за старые
                               бейджи + кустарные самопаи)
                   community — комьюнити (активности спикеров,
                               самодельные)
       company   — от какой компании/кого (для partner/community)
       obtainedFor — за что выдавался
       rarity    — "common" | "uncommon" | "rare" | "epic" | "legendary"
                   | "unknown" (редкость/тираж неизвестны)
       rarityNote — пояснение тиража, напр. "выпущено всего 10 шт."
       description — текст описания
       source    — ссылка, откуда взята информация (или null)
       photos    — массив путей; первое фото — главное
       model3d   — путь к .glb/.gltf или null

   Порядок аддонов на странице года:
   1) сначала id из addonOrder события (если задан),
   2) затем остальные — в порядке следования в addons[] ниже
      (переставляете блоки в файле — меняется порядок на сайте).

   Пути к фото — относительные от корня сайта,
   например "assets/img/2024/badge_1.jpg".
   ============================================================ */

const SITE_DATA = {
  "events": [
    {
      "id": "offzone-2018",
      "title": "OFFZONE 2018",
      "date": "2018",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2018 - Java карта",
        "description": "В 2018 году бейджи еще не были печатными платами, но уже предоставляли доступ к интерактивной части мероприятия. Бейдж по форме и размерам напоминал обычную банковскую карту с чипом, которая позволяла выполнять на ней собственные апплеты, написанные на Java.\n\nАпплеты представляли собой небольшие программы, и именно они были основной интерактивной частью конференции 2018 года. У посетителей была возможность найти USB-считыватель для карт и начать решать задачи и задания с карты. Одним из заданий была игра в классические «Танчики», в которой посетитель играл против карты и должен был победить её. Также было подобие «Сокобана» и множество других задач.\n\nСама идея использования банковской карты в качестве бейджа на конференции по информационной безопасности должна была отсылать посетителей к их уязвимости и тому, как много мошенничеств совершается именно с банковскими картами. Также на каждой карте было имя и номер, который валидный с точки зрения алгоритма проверки. Особенность надписей на карте в том, что они выполнены не обычным принтом на поверхности, а объемным теснением. Как на настоящей банковской карте. И формально карта была пригодна для прокатки на вот таких древних станках.",
        "source": "https://habr.com/ru/articles/707392/",
        "photos": [
          "assets/img/offzone_2018/badge_01.jpg",
          "assets/img/offzone_2018/badge_02.jpg",
        ],
        "model3d": null
      }
    },
    {
      "id": "offzone-2019",
      "title": "OFFZONE 2019",
      "date": "2019",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2019",
        "description": "В 2019 году была среда ретротехнологий. В зале стояли стенды со старыми компьютерами и с игровыми приставками из прошлого. Поэтому у организаторов появилась идея исполнить бейдж в форме какого-то гаджета прошлых лет. Так появился бейдж в виде дискеты, который стал первым бейджем именно в форм-факторе PCB-платы.\n\nНо бейдж попал в руки посетителей конференции в не до конца собранном виде. Некоторые элементы не были припаяны. Как раз в этом и заключалась интерактивная часть. Посетителям необходимо было зарабатывать Offcoin — местную валюту, а уже её обменивать на недостающие элементы. Каждый новый припаянный элемент открывал ещё одну функцию бейджа.\n\nК примеру, посетитель мог дооснастить свой бейдж модулем считывания NFC-карт. Это позволяло подойти к стенду с несколькими картами, прочитать их, распарсить полученные данные и заэмулировать карту, которая была ключом к решению задачи.\n\nакже можно было получить модуль радио, который помогал принимать сообщения от специального сотрудника, периодически появляющегося на площадке с передатчиком в кармане. Из сообщения также надо было извлечь полезные данные. А после модуль радио можно было использовать для обмена сообщениями с другими посетителями OFFZONE.",
        "source": "https://habr.com/ru/articles/707392/",
        "photos": [
          "assets/img/offzone_2019/badge_01.jpg",
          "assets/img/offzone_2019/badge_02.jpg",
        ],
        "model3d": null
      }
    },
    {
      "id": "offzone-2020",
      "title": "OFFZONE 2020",
      "date": "2020",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2020 (невыпущенный)",
        "description": "В 2020 году конференция отменилась из-за пандемии COVID-19. Всем приходилось сидеть дома и общаться в мессенджерах или с помощью видеосвязи. Тем не менее команда организаторов готовилась к OFFZONE. Они успели разработать концепцию, саму плату и даже изготовить целую партию. Но мероприятие отменили, а в офисе компании появилась шутка, что общая площадь изготовленных плат для 2020 года составляет 80 м2, поэтому ими можно выложить целую квартиру вместо паркета.\n\nА идея бейджей 2020 года заключалась в следующем. Кульминацией OFFZONE должен был стать финал CTF-соревнований (Capture The Flag — захват флага), в которых несколько команд соревнуются в защите своей инфраструктуры и взломе инфраструктуры противника. Поэтому на бейдже разместили логотипы команд, которые должны были принять участие в соревновании, и по RGB-светодиоду на каждую команду. Идея была в том, чтобы с помощью светодиодов выводить на бейджи посетителей актуальное состояние соревнований. Этого планировалось добиться с помощью разных цветов и режимов свечения.\n\nНо из-за пандемии и ограничений, связанных с ней, конференция так и не состоялась, а 80 м2 печатных плат остались напоминанием. В 2021 года также не удалось провести OFFZONE. Но за этот год бейджей уже нет.",
        "source": "https://habr.com/ru/articles/707392/",
        "photos": [
          "assets/img/offzone_2020/badge_01.jpg",
          "assets/img/offzone_2020/badge_02.jpg",
          "assets/img/offzone_2020/badge_03.jpeg",
          "assets/img/offzone_2020/badge_04.jpeg",
          "assets/img/offzone_2020/badge_05.jpeg",
          "assets/img/offzone_2020/badge_06.jpeg",
        ],
        "model3d": null
      }
    },
    {
      "id": "offzone-2022",
      "title": "OFFZONE 2022",
      "date": "2022",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2022",
        "description": "В 2022 году центральной темой конференции стал киберпанк, что можно заметить по материалам, которые распространялись, и по людям, посещавшим мероприятие. На стендах можно было заметить отсылки к «Матрице» и людей в футуристичных масках.\n\nДля формы бейджа был выбран силуэт цикады, что стало двойной отсылкой. С одной стороны к группировке из мира игры The Last of Us с одноимённым названием, с другой — к хакерской организации «Цикада 3301», вокруг которой ходит много легенд.\n\n Бейдж сохранил функции платёжного устройства для внутренней валюты конференции. Но в 2022 году у посетителей появилась возможность кастомизировать бейджи. Для этих целей на плате расположили два 4-пиновых shitty-коннектора, которые изначально разработали для DefCon. Организаторы OFFZONE заранее поделились спецификациями, поэтому у каждого была возможность разработать свой собственный аддон и прийти с ним на мероприятие. Аддоны могли быть просто декоративным текстолитом или полноценным устройством.",
        "source": null,
        "photos": [
          "assets/img/offzone_2022/offzone_2022.jpg"
        ],
        "model3d": null
      }
    },
    {
      "id": "offzone-2023",
      "title": "OFFZONE 2023",
      "date": "2023",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2023",
        "description": "Интерактивный бейдж — неотъемлемая часть OFFZONE. С ним ты сможешь участвовать в активностях и зарабатывать очки offcoin, а еще его можно кастомизировать. Каждый бейдж оснащен радиомодулем, способным принимать и передавать данные.",
        "source": null,
        "photos": [
          "assets/img/offzone_2023/offzone_2023.jpg"
        ],
        "model3d": null
      },
      "addonOrder": [
        "oz23-addon-start-x",
        "oz23-addon-positive-technologies",
        "oz23-addon-vk",
        "oz23-addon-mobile-appSec-world",
        "oz23-addon-cyberdom",
        "oz23-addon-kaspersky",
        "oz24-soldering-for-2022",
        "oz22-soldering-for-2019",
        "oz23-soldering-cat",
        "oz23-soldering-ikarus",
        "oz23-soldering-iron",
        "oz23-soldering-lighthouse",
        "oz23-soldering-eye",
      ]
    },
    {
      "id": "offzone-2024",
      "title": "OFFZONE 2024",
      "date": "2024",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2024",
        "description": "Начинка\n\n 1. Радиомодуль\nОн способен принимать и передавать данные. Пройдитесь по конференции и соберите сигналы со всех зон — в каждой бейдж будет светиться разными цветами.\n\n2. USB-С-разъем\nПодключите бейдж к компьютеру при помощи кабеля и найдите COM‑порт. Там вас ждет кое‑какой интерактив.\n\n3. Места под аддоны\nСделайте свой бейдж уникальным! Аддоны можно получить за участие в активностях или собрать самим на Craft.Zone.\n\nИспользование\n\n4. Убедитесь, что бейдж работает\nВставьте батарейки и переведите переключатель на бейдже в положение BAT — диоды начнут светиться и переливаться. Если что-то пойдет не так, приходите на Craft.Zone — разберемся.\n\n5. Следите за офкоинами\nЭто внутренняя валюта конференции. Ее зарабатывают в активностях и обменивают на стильный мерч. Офкоины начисляются на бейдж. Проверить баланс можно в телеграм‑боте или специальном терминале на территории конференции.\n\n6. Соблюдайте правила\nЕсли нарушить правила участия в активности, указанные в месте ее проведения, баланс бейджа обнулится, а сам бейдж — заблокируется.",
        "source": null,
        "photos": [
          "assets/img/offzone_2024/offzone 2024.webp",
          "assets/img/offzone_2024/badge offzone 2024.jpg"
        ],
        "model3d": null
      }
    },
    {
      "id": "offzone-2025",
      "title": "OFFZONE 2025",
      "date": "2025",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2025",
        "description": "Однажды в лаборатории OFFZONE произошел странный инцидент. Незадолго до этого руководитель группы по изучению объекта неизвестного происхождения, получившего кодовое имя CUB_3, начал регулярно пренебрегать техникой безопасности. Из‑за постоянного контакта с объектом психика и нервная система ученого не выдержали. Исследователем завладела паранойя, страх и ненависть к могуществу CUB_3. Эти чувства переросли в сверхценную идею — взять объект под контроль. В попытках достичь желаемого ученый усилил и запустил экспериментальный объект CUB_3.0X (кодовое имя [ZE:RO]), изначально созданный как более стабильный и контролируемый прототип CUB_3. После этого в лаборатории начался сущий кошмар... Это история о том, куда порой приводят чрезмерные амбиции, любопытство и нарушение work-life balance. Подробную историю ищи в игре и на странице CUB_3",
        "source": null,
        "photos": [
          "assets/img/offzone_2025/badge offzone 2025.webp"
        ],
        "model3d": null
      },
      "addonOrder": [
        "oz25-addon-yandex",
        "oz25-addon-k2-cybersecurity",
        "oz25-addon-tbank",
        "oz25-addon-swordfish-securty",
        "oz25-addon-alfabank",
        "oz25-addon-bastion",
        "oz25-addon-reg-ru",
        "oz25-addon-jet-infosystems-pentest-lab",
        "oz25-addon-jet-infosystems-cybercamp",
        "oz25-addon-kaspersky",
        "oz25-addon-bi-zone",
        "oz25-addon-positive-technologies",
        "oz25-soldering-for-2024",
        "oz24-soldering-for-2023",
        "oz25-soldering-angel-and-devil",
        "oz25-soldering-anonymous",
        "oz25-soldering-bear",
        "oz25-soldering-boombox",
        "oz25-soldering-terminal",
        "oz25-soldering-light-hedgehog",
        "oz25-soldering-nyan-cat",
        "oz25-addon-rotten-mechanism",
        "oz25-addon-assume-birch",
      ]
    },
    {
      "id": "offzone-2026",
      "title": "OFFZONE 2026",
      "date": "2026",
      "location": "Москва",
      "badge": {
        "name": "Бейдж OFFZONE 2026",
        "description": "Интерактивный бейдж — неотъемлемая часть OFFZONE. Он позволяет участвовать в активностях и решать таски. А заработанную в процессе игровую валюту, офкоины, можно обменять на стильный мерч. ОСОБЕННОСТИ БЕЙДЖА: 1) переключатель питания - Какой источник питания сейчас подключен, батарейки или USB, — не важно. Электронная схема на бейдже сама разберется, откуда брать энергию; 2)места под аддоны - У бейджа таких мест 3. Не забудь захватить из дома свои аддоны. А чтобы пополнить их коллекцию, участвуй в активностях или заходи на Craft.Zone; 3) USB-С-разъем - При помощи кабеля подключи бейдж к компьютеру и найди COM‑порт. Там тебя ждут инструкции по взаимодействию с бейджем и кое‑какой интерактив;",
        "source": null,
        "photos": [
          "assets/img/offzone_2026/offzone_2026.webp"
        ],
        "model3d": null
      }
    },
    {
      "id": "dc78422-2024",
      "title": "dc78422 2024",
      "date": "2024",
      "location": "Ульяновск",
      "badge": {
        "name": "Бейдж dc78422",
        "description": "DEFCON Ульяновск — сообщество, объединяющее людей, интересующихся изучением и необычным применением современных технологий, часто в направлении информационной безопасности — то есть всем, что понимается в широком положительном смысле слова «хакинг». Основанное в духе группы DEFCON, сообщество открыто для всех, кто хочет учиться новому, желает помогать развиваться другим и просто общаться с людьми с такими же профессиональными взглядами. Бейдж был создан эксклюзивно для встречи 0x09 (https://dc78422.ru/meetup/0x09/), проходившей 20.04.2024.",
        "source": null,
        "photos": [
          "assets/img/dc78422_2024/badge_01.png",
          "assets/img/dc78422_2024/badge_02.jpg"
        ],
        "model3d": null
      }
    },
    {
      "id": "phdays-2024",
      "title": "PHDays Fest 2",
      "date": "2024",
      "location": "Москва",
      "badge": {
        "name": "PHD2 Badge by Positive Labs",
        "description": "Компания Positive Technologies ежегодно в мае проводит киберфестиваль PHDays, который в 2024 году носил название PHDays Fest 2. Специально для этого мероприятия PT выпустили интерактивный бейдж. История интерактивных бейджей берет свое начало с хакерской конференции DEF CON. На официальном сайте конференции есть отдельная статья, посвященная созданию и развитию концепции бейджей (DEF CON Hacking Conference — The Badge). Данный бейдж умеет отображать картинки на пиксельном экране. Есть набор стандартных, но можно подключиться к нему по Wi-Fi и нарисовать собственную картинку.",
        "source": null,
        "photos": [
          "assets/img/phdays_2024/badge_01.jpg",
          "assets/img/phdays_2024/badge_02.png",
          "assets/img/phdays_2024/badge_03.png",
        ],
        "model3d": null
      }
    },
    {
      "id": "phdays-2025",
      "title": "PHDays 2025",
      "date": "2025",
      "location": "Москва",
      "badge": {
        "name": "PHDays Badge by Positive Labs",
        "description": "Новая версия интерактивного бейджа PHDays Badge by Positive Labs. Бейдж построен на базе ESP32 и имеет дисплей с разрешением 10 х 10 пикселей. Поддерживается отображение изображений и анимации, а также воспроизведение RTTTL-мелодий с помощью встроенного динамика. Владелец бейджа может воспользоваться предустановленными вариантами картинок, анимаций и мелодий или создать собственные, подключившись к бейджу по Wi-Fi. Исходный код прошивки и CAD-модели деталей корпуса доступны в репозитории на GitHub (https://github.com/nlef/PHDays-Badge?tab=readme-ov-file). Подробное описание бейджа и инструкции по использованию можно найти в канале Positive Labs (https://t.me/positivelabs).",
        "source": null,
        "photos": [
          "assets/img/phdays_2025/badge_01.png",
          "assets/img/phdays_2025/badge_02.jpeg",
          "assets/img/phdays_2025/badge_03.jpeg"
        ],
        "model3d": null
      }
    },
    {
      "id": "zeronights-2026",
      "title": "ZeroNights 2026",
      "date": "2026",
      "location": "Санкт-Петербург",
      "badge": {
        "name": "Лимитированный PCB-бейдж: MeshMatrish",
        "description": "Автономный терминал для работы в локальной Meshtastic сети.\n\nОставайтесь на связи даже если привычные способы не работают.\n Получайте нотификации о происходящем на ZeroNights.\nЛимитированная серия PCB-бейджей совместно с Rotten Mechanism (https://t.me/RottenMechanism).",
        "source": null,
        "photos": [
          "assets/img/zeronights_2026/MeshMatrish_01.png",
          "assets/img/zeronights_2026/MeshMatrish_02.jpg",
        ],
        "model3d": null
      }
    }
  ],
  "addons": [
    {
      "id": "oz22-addon-taro-card", /*TODO: найти о нем инфу. Без упоминания*/
      "years": [
        "offzone-2022"
      ],
      "name": "Карта Таро",
      "category": "partner",
      "company": "Bi.Zone ???",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Из статьи на Хабре. Там есть фото с этим аддоном. Инфы по нём не нашел.",
      "source": "https://habr.com/ru/articles/707392/",
      "photos": [
        "assets/img/offzone_2022/addon_taro_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz22-soldering-for-2019",
      "years": [
        "offzone-2022",
        "offzone-2023"
      ],
      "name": "Аддон за бейдж 2019 года",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Официальный аддон в обмен на старый бейдж.",
      "rarity": "rare",
      "rarityNote": "Выдавался только в зоне пайки, количество ограничено.",
      "description": "При наличии бейджа за 2019 году выдавался такой аддон за выслугу лет.",
      "source": "https://t.me/offzone_moscow/506",
      "photos": [
        "assets/img/offzone_2022/addon_soldering_for_2019_02.png",
        "assets/img/offzone_2022/addon_soldering_for_2019_03.png",
        "assets/img/offzone_2022/addon_soldering_for_2019_01.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz22-soldering-for-2018",
      "years": [
        "offzone-2022"
      ],
      "name": "Аддон за бейдж 2018 года",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Официальный аддон в обмен на старый бейдж.",
      "rarity": "rare",
      "rarityNote": "Выдавался только в зоне пайки, количество ограничено.",
      "description": "При наличии бейджа за 2018 году выдавался такой аддон за выслугу лет.",
      "source": "https://t.me/offzone_moscow/506",
      "photos": [
        "assets/img/offzone_2022/addon_soldering_for_2018_03.png",
        "assets/img/offzone_2022/addon_soldering_for_2018_02.png",
        "assets/img/offzone_2022/addon_soldering_for_2018_01.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz22-soldering-banana-cat",
      "years": [
        "offzone-2022"
      ],
      "name": "Кот в банане",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2022 году",
      "description": "Победитель в конкурсе на лучший дизайн аддона в 2022 году. Придумал Андрея К.",
      "source": "https://t.me/offzone_moscow/455",
      "photos": [
        "assets/img/offzone_2022/addon_soldering_banana_cat_02.png",
        "assets/img/offzone_2022/addon_soldering_banana_cat_01.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz22-soldering-linux",
      "years": [
        "offzone-2022"
      ],
      "name": "Пингвин Linux",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2022 году",
      "description": "Победитель в конкурсе на лучший дизайн аддона в 2022 году. Придумал Андрея К.",
      "source": "https://t.me/offzone_moscow/455",
      "photos": [
        "assets/img/offzone_2022/addon_soldering_linux_01.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz22-soldering-dino",
      "years": [
        "offzone-2022"
      ],
      "name": "Динозавр",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2022 году",
      "description": "Победитель в конкурсе на лучший дизайн аддона в 2022 году. Придумал Андрея К.",
      "source": "https://t.me/offzone_moscow/455",
      "photos": [
        "assets/img/offzone_2022/addon_soldering_dino_01.jpg",
        "assets/img/offzone_2022/addon_soldering_dino_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz22-addon-def-con",
      "years": [
        "offzone-2022"
      ],
      "name": "Веселый Роджер",
      "category": "community",
      "company": "DEF CON",
      "obtainedFor": "Нет информации",
      "rarity": "uncommon",
      "rarityNote": "Выпущено достатоно много",
      "description": "На бейдже некоторых участников OFFZONE можно было заметить необычный аддон с Веселым Роджером — логотипом DEF CON.\n\nИнтересен он тем, что на обратной стороне расположен небольшой экранчик. Там крутятся логотипы всех сообществ DEF CON, которые приняли участие в OFFZONE 2022.\nИдея принадлежит nipnull, а воплотил ее в жизнь Сергей Норд (https://t.me/RottenMechanism).\n\nРассказываем, из чего состоит аддон.\n\nНачинка:\n— устройство на базе контроллера atmega328p;\n— дисплей 0,96\", 128x64 пикселя на базе контроллера SSD1306 в режиме I2C.\n\nОснова:\n— печатная плата от «Резонита»;\n— стикер с Веселым Роджером из светоотражающей пленки.\n\nСергей разработал и оттрассировал платы, а еще написал прошивку со множеством режимов мигания светодиодов. Также он адаптировал монохромные картинки с логотипами под низкое разрешение. Некоторые даже пришлось рисовать с нуля.\n\nПамяти хватило с лихвой, поэтому, если у вас есть аддон DEF CON, изучите его повнимательнее. \nСоздатель оставил пасхалку :)",
      "source": "https://t.me/offzone_moscow/591",
      "photos": [
        "assets/img/offzone_2022/addon_def_con_01.png",
        "assets/img/offzone_2022/addon_def_con_02.png",
        "assets/img/offzone_2022/addon_def_con_03.png",
        "assets/img/offzone_2022/addon_def_con_04.png",
      ],
      "model3d": null
    },
    {
      "id": "oz22-addon-dc78422",
      "years": [
        "offzone-2022"
      ],
      "name": "dc78422",
      "category": "community",
      "company": "dc78422.ru",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Нет информации",
      "description": "Нет инчормации",
      "source": null,
      "photos": [
        "assets/img/offzone_2022/addon_dc78422_01.png",
        "assets/img/offzone_2022/addon_dc78422_02.png",
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-start-x",
      "years": [
        "offzone-2023"
      ],
      "name": "Собачка сИБа-ин",
      "category": "partner",
      "company": "Start X",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Собачка сИБа-ину напоминает, что прокачанные в кибербезопасности сотрудники — лучшая защита компании.",
      "source": "https://t.me/offzone_moscow/847",
      "photos": [
        "assets/img/offzone_2023/addon_start_x.png"
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-positive-technologies",
      "years": [
        "offzone-2023"
      ],
      "name": "PT Boy v2023",
      "category": "partner",
      "company": "Positive Technologies",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Компания вспомнила времена змеек на Nokia, Nintendo Game Boy и прокачала легендарную игру до 2023-го уровня, создав ретро-аддон PT Boy.",
      "source": "https://t.me/offzone_moscow/847",
      "photos": [
        "assets/img/offzone_2023/addon_positive_technologies_02.png",
        "assets/img/offzone_2023/addon_positive_technologies_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-vk",
      "years": [
        "offzone-2023"
      ],
      "name": "Дигги",
      "category": "partner",
      "company": "VK",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Дигги — самый популярный и смешной маскот VK. Скорее всего, вы тоже его знаете. Бесплатному биткоину от сомнительного криптоинвестора Дигги предпочтет легальный заработок на багбаунти.",
      "source": "https://t.me/offzone_moscow/847",
      "photos": [
        "assets/img/offzone_2023/addon_vk_01.png",
        "assets/img/offzone_2023/addon_vk_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-mobile-appSec-world",
      "years": [
        "offzone-2023"
      ],
      "name": "Мобильник в образе Эша",
      "category": "partner",
      "company": "Mobile AppSec World",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Мобильник — маскот авторского телеграм-канала Юрия Шабалина в образе Эша из «Зловещих мертвецов», которой защищает себя и мир от злобных мобильных багов.",
      "source": "https://t.me/offzone_moscow/847",
      "photos": [
        "assets/img/offzone_2023/addon_mobile_appsec_world.png"
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-cyberdom",
      "years": [
        "offzone-2023"
      ],
      "name": "Киберпёс",
      "category": "partner",
      "company": "Кибердом",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Киберпес живет в Кибердоме и помогает резидентам воплощать классные идеи для индустрии и комьюнити.\n\nСпикерам OFFZONE киберпес дарит 1 месяц бесплатного резидентства в Кибердоме. Сканируйте QR-код на аддоне и скачивайте приложение.",
      "source": "https://t.me/offzone_moscow/847",
      "photos": [
        "assets/img/offzone_2023/addon_cyberdom_02.png",
        "assets/img/offzone_2023/addon_cyberdom_01.png",
        "assets/img/offzone_2023/addon_cyberdom_03.png"
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-kaspersky",
      "years": [
        "offzone-2023"
      ],
      "name": "Мидори Кума",
      "category": "partner",
      "company": "Лаборатория Касперского",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Мидори Кума — маскот компании и герой игры для этичных хакеров «Миссия Мидори White Hat». В рабочее время — хранитель кибербезопасности, в свободное — путешественник, художник, музыкант, спортсмен; в общем, затейник и весельчак.",
      "source": "https://t.me/offzone_moscow/847",
      "photos": [
        "assets/img/offzone_2023/addon_kaspersky.png"
      ],
      "model3d": null
    },
    {
      "id": "oz23-soldering-cat",
      "years": [
        "offzone-2023"
      ],
      "name": "Кибер-кот",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2023 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2023/addon_soldering_cat_01.jpg",
        "assets/img/offzone_2023/addon_soldering_cat_02.jpg",
        "assets/img/offzone_2023/addon_soldering_cat_03.jpg",
        "assets/img/offzone_2023/addon_soldering_cat_04.jpg",
        "assets/img/offzone_2023/addon_soldering_cat_05.jpg",
        "assets/img/offzone_2023/addon_soldering_cat_06.jpg",
      ],
      "model3d": null
    },
    {
      "id": "oz23-soldering-ikarus",
      "years": [
        "offzone-2023"
      ],
      "name": "Икарус",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2023 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2023/addon_soldering_ikarus_01.jpg",
        "assets/img/offzone_2023/addon_soldering_ikarus_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz23-soldering-iron",
      "years": [
        "offzone-2023"
      ],
      "name": "Паяльники",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2023 году",
      "description": "Победитель в конкурсе на лучший дизайн аддона в 2023 году. Придумал Дмитрий М.",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2023/addon_soldering_iron_01.jpg",
        "assets/img/offzone_2023/addon_soldering_iron_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz23-soldering-lighthouse",
      "years": [
        "offzone-2023"
      ],
      "name": "Маяк",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2023 году",
      "description": "Победитель в конкурсе на лучший дизайн аддона в 2023 году. Придумал Дмитрий М. Аддон-маяк: на обратной стороне платы автор разместил мультивибратор — простую схему из нескольких компонентов (пара конденсаторов, пара транзисторов и щепотка резисторов). С ее помощью светодиоды будут попеременно зажигаться и гаснуть, почти как на настоящем маяке.",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2023/addon_soldering_lighthouse_01.jpg",
        "assets/img/offzone_2023/addon_soldering_lighthouse_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz23-soldering-eye",
      "years": [
        "offzone-2023"
      ],
      "name": "Глаз",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2023 году",
      "description": "Победитель в конкурсе на лучший дизайн аддона в 2023 году. Придумал Михаил К.",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2023/addon_soldering_eye_02.jpg",
        "assets/img/offzone_2023/addon_soldering_eye_01.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-enzo",
      "years": [
        "offzone-2023"
      ],
      "name": "Enzo",
      "category": "community", /*TODO: возможно сменить на партнерский и добавить в начале*/
      "company": "Rotten Mechanism",
      "obtainedFor": "",
      "rarity": "legendary",
      "rarityNote": "Один единственный",
      "description": "Rotten Mechanism сделал именной аддон специально для Enzo.", 
      "source": "https://t.me/RottenMechanism/341",
      "photos": [
        "assets/img/offzone_2023/addon_enzo_01.png",
        "assets/img/offzone_2023/addon_enzo_02.png",
        "assets/img/offzone_2023/addon_enzo_03.png",
        "assets/img/offzone_2023/addon_enzo_04.png",
        "assets/img/offzone_2023/addon_enzo_05.png",
      ],
      "model3d": null
    },
    {
      "id": "oz23-addon-osint-mindset",
      "years": [
        "offzone-2023"
      ],
      "name": "Детектив",
      "category": "community", /*TODO: возможно сменить на партнерский и добавить в начале*/
      "company": "Osint Mindset",
      "obtainedFor": "Нет информации",
      "rarity": "rare",
      "rarityNote": "Очень редко встречается",
      "description": "Аддон выдаваемый osint mindset'ом. Нет информации, выдавался ли он за активности, либо только членам Osint Mindset'а.", 
      "source": "https://t.me/osint_mindset/381",
      "photos": [
        "assets/img/offzone_2023/addon_osint_mindset_01.jpg",
        "assets/img/offzone_2023/addon_osint_mindset_02.png",
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-yandex",
      "years": [
        "offzone-2024"
      ],
      "name": "Робот-доставщик",
      "category": "partner",
      "company": "Яндекс",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Робот-доставщик — символ того, что будущее может быть милым и безопасным.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_yandex.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-kaspersky",
      "years": [
        "offzone-2024"
      ],
      "name": "Мидори Кума",
      "category": "partner",
      "company": "Kaspersky",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Мидори Кума — маскот «Лаборатории Касперского». В рабочее время — хранитель кибербезопасности, в свободное — путешественник, художник, спортсмен.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_kaspersky.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-tbank",
      "years": [
        "offzone-2024"
      ],
      "name": "Капибара",
      "category": "partner",
      "company": "Т-Банк",
      "obtainedFor": "Можно было купить на стенде у партнера за 300 OFFCOIN",
      "rarity": "uncommon",
      "rarityNote": "Достаточно большой тираж",
      "description": "Капибара — хранительница технологий и спокойствия команды кибербезопасности «Т-Банка», а еще — ответственная за соревнования по спортивному хакингу T-CTF.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_tbank_02.jpg",
        "assets/img/offzone_2024/addon_tbank_01.png"
        
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-tbank-2",
      "years": [
        "offzone-2024"
      ],
      "name": "Тбанк Дроид ???",
      "category": "partner",
      "company": "Т-Банк",
      "obtainedFor": "Нет информации",
      "rarity": "uncommon",
      "rarityNote": "Нет информации",
      "description": "Нет информации",
      "source": "https://g-group.art/tinkoff_offzone",
      "photos": [
        "assets/img/offzone_2024/addon_tbank_droid_01.jpg",
        "assets/img/offzone_2024/addon_tbank_droid_02.png",
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-positive-labs",
      "years": [
        "offzone-2024"
      ],
      "name": "PT Boy v2024",
      "category": "partner",
      "company": "Positive Technologies",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Все старые фишки на месте, но теперь с классным дизайном и возможностью перепрошивки по USB. А еще — со встроенным CTF: зашитыми в прошивку задачками, за решение которых можно получить позитивный мерч.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_positive_labs_02.png",
        "assets/img/offzone_2024/addon_positive_labs_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-mobile-appsec-world",
      "years": [
        "offzone-2024"
      ],
      "name": "Спящий Мобильник",
      "category": "community",
      "company": "телеграм-канал Mobile AppSec World",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Мобильник — маскот телеграм-канала Mobile AppSec World. Он прошел полное сканирование на уязвимости и сладко спит, не беспокоясь о собственной безопасности.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_mobile_appsec_world.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-swordfish-security",
      "years": [
        "offzone-2024"
      ],
      "name": "Cyber Swordfish",
      "category": "partner",
      "company": "Swordfish Security",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Cyber Swordfish — защитник процессов безопасной разработки, помощник построения DevSecOps и просто очаровательный маскот компании.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_swordfish_security.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-jet-infosystems-blue-team",
      "years": [
        "offzone-2024"
      ],
      "name": "Мангуст",
      "category": "partner",
      "company": "Инфосистемы Джет",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Мангуст — внимательный, ловкий интеллектуал, символ защитников из Jet Security Team.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_jet_infosystems_blue_team_03.jpg",
        "assets/img/offzone_2024/addon_jet_infosystems_blue_team_01.png",
        "assets/img/offzone_2024/addon_jet_infosystems_blue_team_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-jet-infosystems-red-team",
      "years": [
        "offzone-2024"
      ],
      "name": "Кобра",
      "category": "partner",
      "company": "Инфосистемы Джет",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Кобра — грациозный символ атакующей стороны из Jet Pentest Lab.",
      "source": "https://t.me/offzone_moscow/1001",
      "photos": [
        "assets/img/offzone_2024/addon_jet_infosystems_red_team_03.jpg",
        "assets/img/offzone_2024/addon_jet_infosystems_red_team_01.png",
        "assets/img/offzone_2024/addon_jet_infosystems_red_team_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-bizone-bug-bounty", /*TODO: найти о нем инфу. Без упоминания*/
      "years": [
        "offzone-2024"
      ],
      "name": "Жук",
      "category": "partner",
      "company": "BI.ZONE Bug Bounty",
      "obtainedFor": "Нет информации, найти",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Нет описания. В оф канале не нашел упоминания.",
      "source": null,
      "photos": [
        "assets/img/offzone_2024/addon_bizone_bug_bounty_01.png",
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-for-2023",
      "years": [
        "offzone-2024",
        "offzone-2025"
      ],
      "name": "Аддон за бейдж 2023 года",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Официальный аддон в обмен на старый бейдж.",
      "rarity": "rare",
      "rarityNote": "Выдавался только в зоне пайки, количество ограничено.",
      "description": "При наличии бейджа за 2023 году выдавался такой аддон за выслугу лет.",
      "source": "https://t.me/offzone_moscow/1303",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_for_2023_01.png",
        "assets/img/offzone_2024/addon_soldering_for_2023_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-for-2022",
      "years": [
        "offzone-2023",
        "offzone-2024"
      ],
      "name": "Аддон за бейдж 2022 года",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Официальный аддон в обмен на старый бейдж.",
      "rarity": "rare",
      "rarityNote": "Выдавался только в зоне пайки, количество ограничено.",
      "description": "При наличии бейджа за 2022 году выдавался такой аддон за выслугу лет.",
      "source": "https://t.me/offzone_moscow/684",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_for_2022_01.png",
        "assets/img/offzone_2024/addon_soldering_for_2022_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-cube-blue",
      "years": [
        "offzone-2024"
      ],
      "name": "Синий куб",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2024 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_cube_blue_01.jpg",
        "assets/img/offzone_2024/addon_soldering_cube_blue_02.jpg",
        "assets/img/offzone_2024/addon_soldering_cube_blue_03.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-cube-green",
      "years": [
        "offzone-2024"
      ],
      "name": "Зелёный куб",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2024 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_cube_green_01.jpg",
        "assets/img/offzone_2024/addon_soldering_cube_green_02.jpg",
        "assets/img/offzone_2024/addon_soldering_cube_green_03.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-cube-red",
      "years": [
        "offzone-2024"
      ],
      "name": "Красный куб",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2024 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_cube_red_01.jpg",
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-lamp",
      "years": [
        "offzone-2024"
      ],
      "name": "Лампа",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2024 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_lamp_01.jpg",
        "assets/img/offzone_2024/addon_soldering_lamp_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-seal",
      "years": [
        "offzone-2024"
      ],
      "name": "Тюлень",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2024 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_seal_01.jpg",
        "assets/img/offzone_2024/addon_soldering_seal_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-this-is-fine",
      "years": [
        "offzone-2024"
      ],
      "name": "This is fine",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2024 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_thisisfine_01.jpg",
        "assets/img/offzone_2024/addon_soldering_thisisfine_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-soldering-zil",
      "years": [
        "offzone-2024"
      ],
      "name": "Зил",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2024 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2024/addon_soldering_zil_01.jpg",
        "assets/img/offzone_2024/addon_soldering_zil_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-spbctf",
      "years": [
        "offzone-2024"
      ],
      "name": "Ыж",
      "category": "community", /*TODO: возможно сменить на партнерский и добавить в начале*/
      "company": "SPbCTF",
      "obtainedFor": "Решить таски на LLM. Также можно было купить за 170 OFFCOIN.",
      "rarity": "uncommon",
      "rarityNote": "Было раздано 100 аддонов на конфе",
      "description": "Нету описания", 
      "source": "https://t.me/spbctf/242372",
      "photos": [
        "assets/img/offzone_2024/addon_spbctf_02.png",
        "assets/img/offzone_2024/addon_spbctf_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-soviet-tv",
      "years": [
        "offzone-2024"
      ],
      "name": "Советский телевизор",
      "category": "community", /*TODO: возможно сменить на партнерский и добавить в начале*/
      "company": "Rotten Mechanism",
      "obtainedFor": "Выдавались за решение самых сложных заданий на стендах по локпику и осинту на COMMUNITY.TRACK.",
      "rarity": "rare",
      "rarityNote": "Очень малое количество???",
      "description": "Rotten Mechanism проводил конкурс на лучшую идею для аддона. По итогам голосования победил данный вариант.\nПри однократном нажатии сразу после подачи питания запускается игра \"Звездолёт\", по однократному нажатию на кнопку после обычной загрузки осуществляется переключение каналов, а по тройному активируется срочный выход новостей (тайминг видео 2:50), в котором спряталась точка входа в квест. Кстати говоря, до конца его так никто и не прошёл, так что призы ещё остались, покажите на что вы способны^^ Ждём как минимум одного призёра, а после опубликую райтап, удачи в решении.\nUPD: Теперь каждый желающий может собрать себе (https://github.com/kainsamara/addon24) такой же аддончик^^", 
      "source": "https://t.me/RottenMechanism/425",
      "photos": [
        "assets/img/offzone_2024/addon_soviet_tv_01.png",
        "assets/img/offzone_2024/addon_soviet_tv_02.png",
        "assets/img/offzone_2024/addon_soviet_tv_03.png",
        "assets/img/offzone_2024/addon_soviet_tv_04.png"
      ],
      "model3d": null
    },
    {
      "id": "oz24-addon-robot", /*TODO: найти фото лучше, найти информацию о нем*/
      "years": [
        "offzone-2024"
      ],
      "name": "Неизвестный робот",
      "category": "community", 
      "company": "Нет информации",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Нет информации",
      "description": "Нет информации",
      "source": null,
      "photos": [
        "assets/img/offzone_2024/addon_robot_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-yandex",
      "years": [
        "offzone-2025"
      ],
      "name": "Робот-доставщик",
      "category": "partner",
      "company": "Яндекс",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Робот-доставщик Яндекс - символ того, что будущее может быть безопасным.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_yandex.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-k2-cybersecurity",
      "years": [
        "offzone-2025"
      ],
      "name": "Путь к вершине",
      "category": "partner",
      "company": "К2 Кибербезопасность",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Символизирует путь к вершине информационной безопасности, воплощения мастерства и надёжной защиты.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_k2.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-tbank",
      "years": [
        "offzone-2025"
      ],
      "name": "Цифровой пёс",
      "category": "partner",
      "company": "Т-Банк",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Защищает, наблюдает и мгновенно реагирует. Внутри NFC-метка с испытанием.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_tbank_02.png",
        "assets/img/offzone_2025/addon_tbank_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-swordfish-securty",
      "years": [
        "offzone-2025"
      ],
      "name": "Светящаяся рыба-меч",
      "category": "partner",
      "company": "Swordfish Securty",
      "obtainedFor": "Можно было купить на стенде за 240 OFFCOIN",
      "rarity": "uncommon",
      "rarityNote": "Тираж неизвестен",
      "description": "Нет описания",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_swordfish_securty_02.png",
        "assets/img/offzone_2025/addon_swordfish_securty_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-alfabank",
      "years": [
        "offzone-2025"
      ],
      "name": "Костёр",
      "category": "partner",
      "company": "Альфа-Банк",
      "obtainedFor": "Можно было купить на стенде за 657 OFFCOIN",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Костёр - место силы даже в цифровом мире. AppSec - такая же работа, источник знаний и безопасности, помогающая противостоять уязвимостям.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_alfabank_02.png",
        "assets/img/offzone_2025/addon_alfabank_01.png",
        "assets/img/offzone_2025/addon_alfabank_03.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-bastion",
      "years": [
        "offzone-2025"
      ],
      "name": "ИБ Самурай",
      "category": "partner",
      "company": "Бастион",
      "obtainedFor": "Можно было купить на стенде за ??? OFFCOIN",
      "rarity": "uncommon",
      "rarityNote": "Тираж неизвестен",
      "description": "Следует кодексу киберчести.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_bastion.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-reg-ru",
      "years": [
        "offzone-2025"
      ],
      "name": "Папочка",
      "category": "partner",
      "company": "Рег.ру",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Логотип для киберпапочек.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_reg_ru_03.png",
        "assets/img/offzone_2025/addon_reg_ru_01.png",
        "assets/img/offzone_2025/addon_reg_ru_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-jet-infosystems-pentest-lab",
      "years": [
        "offzone-2025"
      ],
      "name": "Кобра",
      "category": "partner",
      "company": "Jet Infosystems",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Нет описания",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_jet_infosystems_pentest_lab_02.png",
        "assets/img/offzone_2025/addon_jet_infosystems_pentest_lab_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-jet-infosystems-cybercamp",
      "years": [
        "offzone-2025"
      ],
      "name": "CyberCamp",
      "category": "partner",
      "company": "Jet Infosystems",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Кот - как символ любознательности.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_jet_infosystems_cybercamp_02.png",
        "assets/img/offzone_2025/addon_jet_infosystems_cybercamp_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-kaspersky",
      "years": [
        "offzone-2025"
      ],
      "name": "Мидори Кума",
      "category": "partner",
      "company": "Kaspersky",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Тираж неизвестен",
      "description": "Хранитель кибер иммунитета и маскот лаборатории Касперского.",
      "source": "https://t.me/offzone_moscow/1236",
      "photos": [
        "assets/img/offzone_2025/addon_kaspersky_03.png",
        "assets/img/offzone_2025/addon_kaspersky_02.png",
        "assets/img/offzone_2025/addon_kaspersky_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-bi-zone",
      "years": [
        "offzone-2025"
      ],
      "name": "Бизон",
      "category": "partner",
      "company": "Bi.Zone",
      "obtainedFor": "За прохождение всего квеста. Суперприз.",
      "rarity": "rare",
      "rarityNote": "Тираж неизвестен",
      "description": "Нет описания",
      "source": "https://t.me/offzone_moscow/1244",
      "photos": [
        "assets/img/offzone_2025/addon_bi_zone_02.jpg",
        "assets/img/offzone_2025/addon_bi_zone_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-positive-technologies",
      "years": [
        "offzone-2025"
      ],
      "name": "Мужик и медведь",
      "category": "partner",
      "company": "Positive Technologies",
      "obtainedFor": "За лучший вопрос спикеру",
      "rarity": "legendary",
      "rarityNote": "Скорее всего очень ограниченное количество. Всего 15 штук.",
      "description": "Представляем дамамъ и господамъ, кои отправятся на ОФФЗОНЪ 2025, новомодный аддонъ от Позитивных Лабораторий\n\nЕжели любите вы традиционные русские забавы и игрушки, то аддон наш «Мужик и медведь» станет милым приветом из детства.\n\nЕжели нравится вам пробовать что-то новое и любопытное, тоже внакладе не останетесь — еще никто в истории OFFZONE-аддонов не задействовал в них сервопривод, а тем паче, в сочетании с обычной механикой.\n\nСлушайте доклады мастеров умелых Позитивных Лабораторий, (https://t.me/positivelabs/53) да аддон олдскульный, без лишних светодиодов и дисплеев, себе на бедж добывайте — выдавать за лучший вопрос будем. Удачи!",
      "source": "https://t.me/Positive_Technologies/3723",
      "photos": [
        "assets/img/offzone_2025/addon_positive_technologies_01.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-angel-and-devil",
      "years": [
        "offzone-2025"
      ],
      "name": "Ангел и демон",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2025 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2025/addon_soldering_angel_and_devil_01.jpg",
        "assets/img/offzone_2025/addon_soldering_angel_and_devil_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-anonymous",
      "years": [
        "offzone-2025"
      ],
      "name": "Anonymous",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2025 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2025/addon_soldering_anonymous_01.jpg",
        "assets/img/offzone_2025/addon_soldering_anonymous_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-bear",
      "years": [
        "offzone-2025"
      ],
      "name": "Медведь",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2025 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2025/addon_soldering_bear_01.jpg",
        "assets/img/offzone_2025/addon_soldering_bear_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-boombox",
      "years": [
        "offzone-2025"
      ],
      "name": "Магнитофон",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2025 году",
      "description": "Отсутствует",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2025/addon_soldering_boombox_01.jpg",
        "assets/img/offzone_2025/addon_soldering_boombox_02.jpg",
        "assets/img/offzone_2025/addon_soldering_boombox_03.jpg",
        "assets/img/offzone_2025/addon_soldering_boombox_04.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-terminal",
      "years": [
        "offzone-2022",
        "offzone-2025"
      ],
      "name": "Терминал",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2025 году",
      "description": "Победитель в конкурсе на лучший дизайн аддона в 2022 году. Придумал Андрея К.",
      "source": "https://t.me/bizone_hwlab/61",
      "photos": [
        "assets/img/offzone_2025/addon_soldering_terminal_01.jpg",
        "assets/img/offzone_2025/addon_soldering_terminal_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-light-hedgehog",
      "years": [
        "offzone-2025"
      ],
      "name": "Светодиежик",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2025 году",
      "description": "Нет информации",
      "source": "https://t.me/bizone_hwlab/31",
      "photos": [
        "assets/img/offzone_2025/addon_soldering_light_hedgehog_01.png",
        "assets/img/offzone_2025/addon_soldering_light_hedgehog_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-nyan-cat",
      "years": [
        "offzone-2025"
      ],
      "name": "Nyan Cat",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2025 году",
      "description": "Нет информации",
      "source": null,
      "photos": [
        "assets/img/offzone_2025/addon_soldering_nyan_cat_01.png",
        "assets/img/offzone_2025/addon_soldering_nyan_cat_02.png",
        "assets/img/offzone_2025/addon_soldering_nyan_cat_03.png",
        "assets/img/offzone_2025/addon_soldering_nyan_cat_04.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-mr-technique",
      "years": [
        "offzone-2025"
      ],
      "name": "MR. Technique",
      "category": "community",
      "company": "Нет информации",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Нет информации",
      "description": "Нет информации",
      "source": null,
      "photos": [
        "assets/img/offzone_2025/addon_mr_technique_01.png",
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-rotten-mechanism",
      "years": [
        "offzone-2025"
      ],
      "name": "Кресты",
      "category": "community",
      "company": "Rotten Mechanism",
      "obtainedFor": "Нет информации",
      "rarity": "uncommon",
      "rarityNote": "Выпущено достатоно много",
      "description": "",
      "source": "https://t.me/RottenMechanism/475",
      "photos": [
        "assets/img/offzone_2025/addon_rotten_mechanism.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-assume-birch", /*TODO: найти более качественные фото. Больше инфы о раритетности*/
      "years": [
        "offzone-2025"
      ],
      "name": "Аддон Assume Birch",
      "category": "community",
      "company": "Assume Birch",
      "obtainedFor": "Нет информации",
      "rarity": "rare",
      "rarityNote": "Не очень часто можно найти его примеры.",
      "description": "Нет информации",
      "source": "https://t.me/assume_birch",
      "photos": [
        "assets/img/offzone_2025/addon_assume_birch_01.png",
        "assets/img/offzone_2025/addon_assume_birch_02.png",
        "assets/img/offzone_2025/addon_assume_birch_03.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-addon-lockpic", /*TODO: найти более качественные фото. Больше инфы о раритетности*/
      "years": [
        "offzone-2025"
      ],
      "name": "ЛокПик",
      "category": "community",
      "company": "the autopsy will tell",
      "obtainedFor": "За решение нескольких заданий на стенде вы сможете получить аддон-сейф с мини-квестом.",
      "rarity": "legendary",
      "rarityNote": "Очень редкий. На стенде раздали 20 штук",
      "description": "Создано: Phoenix Nest (https://t.me/phoenix_nest87). Нам хотелось, чтобы аддон был тематическим (про замки), интерактивным и просто крутым на вид. Так родилась идея с сейфом. Кстати, настоящий сейфовый замок традиционно представлен на стенде зоны Локпик и любой желающий может попытаться его открыть =)",
      "source": "https://t.me/autopsy_wt/88",
      "photos": [
        "assets/img/offzone_2025/addon_lockpick_01.png",
        "assets/img/offzone_2025/addon_lockpick_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-kaspersky",
      "years": [
        "offzone-2026"
      ],
      "name": "Картина с Мидори Кумой",
      "category": "partner",
      "company": "Kaspersky",
      "obtainedFor": "Нет информации, найти",
      "rarity": "rare",
      "rarityNote": "Тираж неизвестен",
      "description": "Аддон-картина, где среди звездных вихрей спрятался Мидори Кума, маскот Лаборатории Касперского.",
      "source": "https://t.me/offzone_moscow/1576",
      "photos": [
        "assets/img/offzone_2026/addon_kaspersky.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-xello",
      "years": [
        "offzone-2026"
      ],
      "name": "Пчелка Xello",
      "category": "partner",
      "company": "Xello",
      "obtainedFor": "Нет информации, найти",
      "rarity": "legendary",
      "rarityNote": "Тираж неизвестен",
      "description": "Быстрая и внимательная стражница киберпространства. Разворачивает приманки и ловушки, создавая ложный слой, неотличимый от реальной инфраструктуры. Любой неверный шаг злоумышленника - и он уже замечен. Ведь лучший способ поймать злоумышленника - заставить его поверить, что добыча уже перед ним.",
      "source": "https://t.me/offzone_moscow/1576",
      "photos": [
        "assets/img/offzone_2026/addon_xello_01.png",
        "assets/img/offzone_2026/addon_xello_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-sber",
      "years": [
        "offzone-2026"
      ],
      "name": "ИИ Защитник",
      "category": "partner",
      "company": "Сбер",
      "obtainedFor": "Нужно было решить 1 задачу на web, pwn и ещё какую-то категорию",
      "rarity": "uncommon",
      "rarityNote": "Тираж неизвестен",
      "description": "Символ партнерства человека и ИИ-технологий в кибербезопасности.",
      "source": "https://t.me/offzone_moscow/1576",
      "photos": [
        "assets/img/offzone_2026/addon_sber.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-usergate-owl",
      "years": [
        "offzone-2026"
      ],
      "name": "Сова",
      "category": "partner",
      "company": "UserGate",
      "obtainedFor": "Была мини-игра в SOC специалиста. Были разложены карточки с инцидентом и нужно было определить какие валидные, а что ложное срабатывание. А затем нужно было разложить карточки в верном порядке инцидента. На выбор были либо сова, либо лучник",
      "rarity": "uncommon",
      "rarityNote": "Тираж неизвестен",
      "description": "Сова воплощает в себе важные для сотрудников ИБ способности: проницательность, невозмутимость, концентрацию.",
      "source": "https://t.me/offzone_moscow/1576",
      "photos": [
        "assets/img/offzone_2026/addon_usergate_owl.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-usergate-archer",
      "years": [
        "offzone-2026"
      ],
      "name": "Лучник",
      "category": "partner",
      "company": "UserGate",
      "obtainedFor": "Была мини-игра в SOC специалиста. Были разложены карточки с инцидентом и нужно было определить какие валидные, а что ложное срабатывание. А затем нужно было разложить карточки в верном порядке инцидента. На выбор были либо сова, либо лучник",
      "rarity": "uncommon",
      "rarityNote": "Тираж неизвестен",
      "description": "Лучник - меткий защитник сетевого мира, вдохновленный подвигом Геракла, победившего стимфалийских птиц. Подобно мифическому герою, он безошибочно выявляет и нейтрализует киберугрозы.",
      "source": "https://t.me/offzone_moscow/1576",
      "photos": [
        "assets/img/offzone_2026/addon_usergate_archer.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-rt-protect",
      "years": [
        "offzone-2026"
      ],
      "name": "Буран",
      "category": "partner",
      "company": "РТ-ИБ",
      "obtainedFor": "Нет информации, найти",
      "rarity": "rare",
      "rarityNote": "Тираж неизвестен",
      "description": "Буран - следователь из РТ-ИБ с горящими глазами, чей образ объединяет внимательность, экспертизу и поиск неизвестного.",
      "source": "https://t.me/offzone_moscow/1576",
      "photos": [
        "assets/img/offzone_2026/addon_rt_protect.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-jet-infosystems-cybercamp",
      "years": [
        "offzone-2026"
      ],
      "name": "CyberCamp",
      "category": "partner",
      "company": "Инфосистемы Джет",
      "obtainedFor": "Нет информации, найти",
      "rarity": "uncommon",
      "rarityNote": "Тираж неизвестен",
      "description": "Нет описания, дополнить",
      "source": "https://t.me/offzone_moscow/1714",
      "photos": [
        "assets/img/offzone_2026/addon_cybercamp_01.jpg",
        "assets/img/offzone_2026/addon_cybercamp_02.jpg",
        "assets/img/offzone_2026/addon_cybercamp_03.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-jet-infosystems-jetcsirt",
      "years": [
        "offzone-2026"
      ],
      "name": "JetCSIRT",
      "category": "partner",
      "company": "Инфосистемы Джет",
      "obtainedFor": "За форензику и осинт",
      "rarity": "legendary",
      "rarityNote": "Крайне редкий",
      "description": "Нет описания, дополнить",
      "source": "https://t.me/jetcybercamp/112/43388",
      "photos": [
        "assets/img/offzone_2026/addon_jetcsirt_01.jpg",
        "assets/img/offzone_2026/addon_jetcsirt_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-hack-15-min",
      "years": [
        "offzone-2026"
      ],
      "name": "PWN!!",
      "category": "partner",
      "company": "Стенд Hack for 15 min",
      "obtainedFor": "За участие в поединке Взломай за 15 минут. Достатоно было заранее записаться и попытаться решить CTF-таск. Даже при неудачной попытке выдавали аддон.",
      "rarity": "uncommon",
      "rarityNote": "Достаточно большой тираж",
      "description": "Нет описания, дополнить",
      "source": null,
      "photos": [
        "assets/img/offzone_2026/addon_hack_15_min.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-bastion",
      "years": [
        "offzone-2026"
      ],
      "name": "Танец",
      "category": "partner",
      "company": "Бастион",
      "obtainedFor": "Можно было купить на стенде за 110 OFFCOIN",
      "rarity": "uncommon",
      "rarityNote": "Достаточно большой тираж",
      "description": "Мы верим, что в искусстве как и в кибербезопасности важен не просто человек, а группа людей, которые действуют сообща. В едином танце. Вместе. Дружно. Мирно. И именно в таком сплоченном объединении, в таком танце мы можем делать не просто нашу работу качественно, но и делать мир лучше.",
      "source": "https://t.me/bastiontech/330",
      "photos": [
        "assets/img/offzone_2026/addon_bastion.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-cub-3",
      "years": [
        "offzone-2026"
      ],
      "name": "OFFGOTCHI",
      "category": "partner",
      "company": "Стенд CUB_3",
      "obtainedFor": "Получить аддон можно в зоне CUB_3 за прохождение игры OFFZONE Museum Incident. А следить за результатами битв — на лидерборде на сайте (https://rottenmechanism.com/offzone26/).",
      "rarity": "legendary",
      "rarityNote": "Очень редкий, не больше 10 вроде (точное количество неизвестно)",
      "description": "Автор этой разработки — наш друг @RottenMechanism, который каждый год радует нас своим креативом. А сейчас, кажется, превзошел самого себя :)\nЕсли вы когда-то не выпускали из рук тамагочи, этот аддон вернет вас в детство. Здесь тоже нужно выращивать питомца и ухаживать за ним.\nКогда достигнете пятого уровня эволюции, можно будет сражаться с другими игроками. Все подробности собрали в карточках.",
      "source": "https://t.me/offzone_moscow/1561",
      "photos": [
        "assets/img/offzone_2026/addon_offgotchi_01.jpg",
        "assets/img/offzone_2026/addon_offgotchi_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-for-2025",
      "years": [
        "offzone-2026"
      ],
      "name": "Аддон за бейдж 2025 года",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Официальный аддон в обмен на старый бейдж.",
      "rarity": "rare",
      "rarityNote": "Выдавался только в зоне пайки, количество ограничено.",
      "description": "При наличии бейджа за 2025 году выдавался такой аддон за выслугу лет.",
      "source": "https://t.me/offzone_moscow/1584",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_for_2025_02.png",
        "assets/img/offzone_2026/addon_soldering_for_2025_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz25-soldering-for-2024",
      "years": [
        "offzone-2026",
        "offzone-2025"
      ],
      "name": "Аддон за бейдж 2024 года",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Официальный аддон в обмен на старый бейдж.",
      "rarity": "rare",
      "rarityNote": "Выдавался только в зоне пайки, количество ограничено.",
      "description": "При наличии бейджа за 2024 году выдавался такой аддон за выслугу лет.",
      "source": "https://t.me/offzone_moscow/1584",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_for_2024_02.png",
        "assets/img/offzone_2026/addon_soldering_for_2024_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-bus-liaz",
      "years": [
        "offzone-2026"
      ],
      "name": "Автобус ЛиАЗ",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "ЛиАЗ все-таки доехал до OFFZONE. Должен был появиться еще в 2023-м, но немного задержался — зато теперь триптих советских автобусов наконец завершен. Или это уже начало квадриптиха?",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_bus_liaz.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-payka",
      "years": [
        "offzone-2026"
      ],
      "name": "Пайка!",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Если вдруг забудете, куда идти на конференции в первую очередь, этот аддон подскажет: «Пайка!» А чтобы не отвлекать вас от красоты самой платы, светодиоды можно вообще выключить.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_payka.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-soup",
      "years": [
        "offzone-2026"
      ],
      "name": "Суп",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Простая и питательная плата. Легко утолит ваш голод по аддонам — по крайней мере до следующего.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_soup.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-boom-white-red",
      "years": [
        "offzone-2026"
      ],
      "name": "BOOM (красно-белый)",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Бум! Бэнг! Воу! Поп! На этом наш словарный запас закончился. А выбрать между двумя вариантами мы так и не смогли, поэтому сделали оба — решать будете вы в зоне пайки.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_boom_white_red.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-boom-full-red",
      "years": [
        "offzone-2026"
      ],
      "name": "BOOM (красный)",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Бум! Бэнг! Воу! Поп! На этом наш словарный запас закончился. А выбрать между двумя вариантами мы так и не смогли, поэтому сделали оба — решать будете вы в зоне пайки.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_boom_full_red.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-cub-venera",
      "years": [
        "offzone-2026"
      ],
      "name": "Куб Венера",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Немного OFFZONE, немного Боттичелли. Получилась наша собственная версия символа конференции — с легким художественным сдвигом.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_cub_venera.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-offzone-display",
      "years": [
        "offzone-2026"
      ],
      "name": "OFFZONE с дисплеем",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Чистое интерактивное полотно для самовыражения. Что именно появится на дисплее — зависит только от вас.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_offzone_display.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-cub-dali",
      "years": [
        "offzone-2026"
      ],
      "name": "Куб Дали",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Наша попытка представить, как выглядел бы символ OFFZONE после встречи с сюрреализмом.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_cub_dali.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-rumyntsevo",
      "years": [
        "offzone-2026"
      ],
      "name": "«Румянцево»",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Что появилось раньше: любовь к модернизму или схема с трехсекционным астабильным мультивибратором? Создатели станции метро «Румянцево» вдохновились работами Пита Мондриана, а мы — самой станцией. Собирайте аддон на Craft.Zone и решайте этот философский вопрос сами.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_rumyntsevo.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-cactus",
      "years": [
        "offzone-2026"
      ],
      "name": "Кактус",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Ну и кактус. Советуем поставить рядом с компьютером. Поливать не нужно.",
      "source": "https://t.me/bizone_hwlab/69",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_cactus.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-rose",
      "years": [
        "offzone-2026"
      ],
      "name": "Роза",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Нет информации. Только предположение, что это с зоны пайки.",
      "source": "https://t.me/offzone_moscow/1552",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_rose_01.png",
        "assets/img/offzone_2026/addon_soldering_rose_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-soldering-canvas",
      "years": [
        "offzone-2026"
      ],
      "name": "Полотно",
      "category": "soldering",
      "company": "Зона пайки OFFZONE (Craft.Zone)",
      "obtainedFor": "Аддон, который можно было самостоятельно спаять на конференции.",
      "rarity": "uncommon",
      "rarityNote": "Было спаяно довольно много наборов в 2026 году",
      "description": "Нет информации. Только предположение, что это с зоны пайки.",
      "source": "https://t.me/offzone_moscow/1707",
      "photos": [
        "assets/img/offzone_2026/addon_soldering_canvas_01.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-ssti",
      "years": [
        "offzone-2026"
      ],
      "name": "SSTI",
      "category": "community",
      "company": "Спикер - Владислав Корчагин",
      "obtainedFor": "Помимо доклада, Владислав подготовил CTF-таск, за решение которого первые 10 участников получат уникальный аддон от спикера.",
      "rarity": "legendary",
      "rarityNote": "Выпущено всего ~10 штук.",
      "description": "20 августа в 12:00 на Main track с докладом «Нелогические предположения: ищем RCE в безопасных шаблонизаторах» (https://offzone.moscow/program/logic-less-assumptions-looking-for-rce-in-safe-template-engines/) выступит Владислав Корчагин.",
      "source": "https://t.me/offzone_moscow/1540",
      "photos": [
        "assets/img/offzone_2026/addon_ssti.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-assume-birch",
      "years": [
        "offzone-2026"
      ],
      "name": "Аддон Assume Birch",
      "category": "community",
      "company": "Assume Birch",
      "obtainedFor": "Как его можно получить?\n\nОдно из двух:\n- быть в любой нашей футболке\n- показать проходку на любой из прошедших наших митапов\n\nОбязательное:\n- быть подписанным на наш канал @assume_birch и наших партнёров @purpleshift\n\nГде его можно получить?\nЗавтра весь день на треке.",
      "rarity": "legendary",
      "rarityNote": "Количество сильно ограничено",
      "description": "Аддон содержит базовую прошивку, но вы можете загрузить свою",
      "source": "https://t.me/assume_birch/261",
      "photos": [
        "assets/img/offzone_2026/addon_assume_birch_01.jpg",
        "assets/img/offzone_2026/addon_assume_birch_02.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-duckerz",
      "years": [
        "offzone-2026"
      ],
      "name": "Утка с флагом",
      "category": "community",
      "company": "CTF платформа Duckerz",
      "obtainedFor": "Выдавали за посещение их доклада",
      "rarity": "rare",
      "rarityNote": "Редко у кого видел, но распространенным было",
      "description": "Нет подробностей",
      "source": "https://t.me/duckerz/587",
      "photos": [
        "assets/img/offzone_2026/addon_duckerz_01.jpg",
        "assets/img/offzone_2026/addon_duckerz_02.png"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-husky-rkn",
      "years": [
        "offzone-2026"
      ],
      "name": "РКН!",
      "category": "community",
      "company": "Аддон от Husky",
      "obtainedFor": "За активности на комьюнити стендах?",
      "rarity": "unknown",
      "rarityNote": "Редко у кого видел, но распространенным было",
      "description": "Нет подробностей",
      "source": "https://t.me/jetcybercamp/112/43484",
      "photos": [
        "assets/img/offzone_2026/addon_husky_rkn.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-corrupted-file",
      "years": [
        "offzone-2026"
      ],
      "name": "Битый файл",
      "category": "community",
      "company": "Аддон от Husky",
      "obtainedFor": "За активности на комьюнити стендах?",
      "rarity": "unknown",
      "rarityNote": "Редко у кого видел, но распространенным было",
      "description": "Нет подробностей. Также было на предыдущем году.",
      "source": "https://t.me/jetcybercamp/112/43484",
      "photos": [
        "assets/img/offzone_2026/addon_husky_file.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-lain",
      "years": [
        "offzone-2026"
      ],
      "name": "Лэйн",
      "category": "community",
      "company": "Аддон от Husky",
      "obtainedFor": "За активности на комьюнити стендах?",
      "rarity": "unknown",
      "rarityNote": "Редко у кого видел, но распространенным было",
      "description": "Нет подробностей",
      "source": "https://t.me/jetcybercamp/112/43484",
      "photos": [
        "assets/img/offzone_2026/addon_husky_lain.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-fox",
      "years": [
        "offzone-2026"
      ],
      "name": "Лиса",
      "category": "community",
      "company": "Аддон от Husky",
      "obtainedFor": "За активности на комьюнити стендах?",
      "rarity": "unknown",
      "rarityNote": "Редко у кого видел, но распространенным было",
      "description": "Нет подробностей. Также было на предыдущем году.",
      "source": "https://t.me/jetcybercamp/112/43484",
      "photos": [
        "assets/img/offzone_2026/addon_husky_fox.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-yae-miko-genshin-impact",
      "years": [
        "offzone-2026"
      ],
      "name": "Яэ Мико из Genshin",
      "category": "community",
      "company": "Аддон от Husky",
      "obtainedFor": "За активности на комьюнити стендах?",
      "rarity": "unknown",
      "rarityNote": "Редко у кого видел, но распространенным было",
      "description": "Аддон с принтом обоев с персонажем Яэ Мико из Genshin Impact. Нашел источник вот тут: https://www.hoyolab.com/article/29694245. Также эти обои есть на pinterest.com. Также было на предыдущем году.",
      "source": "https://t.me/jetcybercamp/112/43484",
      "photos": [
        "assets/img/offzone_2026/addon_husky_yae_miko.jpg"
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-with-name",
      "years": [
        "offzone-2026"
      ],
      "name": "Именной аддон",
      "category": "community",
      "company": "Аддон от Husky",
      "obtainedFor": "За активности на комьюнити стендах?",
      "rarity": "unknown",
      "rarityNote": "Редко у кого видел, но распространенным было",
      "description": "Можно на нём написать свой ник/имя",
      "source": "https://t.me/jetcybercamp/112/43484",
      "photos": [
        "assets/img/offzone_2026/addon_husky_with_name_02.png",
        "assets/img/offzone_2026/addon_husky_with_name_01.jpg",
      ],
      "model3d": null
    },
    {
      "id": "oz26-addon-gm-cube",
      "years": [
        "offzone-2026"
      ],
      "name": "Неизвестный куб",
      "category": "community",
      "company": "Нет информации",
      "obtainedFor": "Нет информации",
      "rarity": "unknown",
      "rarityNote": "Нет информации",
      "description": "Нет информации. Возможно самоделка",
      "source": "https://t.me/offzone_moscow/1707",
      "photos": [
        "assets/img/offzone_2026/addon_gm_cube_01.png",
        "assets/img/offzone_2026/addon_gm_cube_02.png"
      ],
      "model3d": null
    },
  ]
};
