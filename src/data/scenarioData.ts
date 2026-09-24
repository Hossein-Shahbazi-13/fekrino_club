import { RoleDefinition, RoleKey, ScenarioInfo, ScenarioType } from '../types/mafia';

export const ALL_ROLES: Record<RoleKey, RoleDefinition> = {
  // === BAZPORS & GENERAL ROLES ===
  BAZPORS: {
    key: 'BAZPORS',
    nameFa: 'بازپرس',
    nameEn: 'Investigator',
    side: 'CITIZEN',
    color: '#38bdf8',
    shortDesc: 'قهرمان سناریو بازپرس؛ استعلام هم‌سایدی و شروع دادگاه بازپرسی',
    fullDesc: 'بازپرس کلیدی‌ترین نقش شهروندی است. در شب ۲ بازیکن را انتخاب می‌کند تا بداند هم‌ساید هستند یا نه. همچنین ۱ بار در بازی می‌تواند دادگاه بازپرسی راه بیندازد تا در روز بعد دو متهم دفاع کنند و با خواب نیم‌روز بازپرس، رأی‌گیری خروج قطعی با اعلام ساید انجام شود.',
    nightActionDesc: 'استعلام هم‌سایدی ۲ بازیکن + امکان انتخاب ۲ مظنون برای دادگاه روز بعد.',
    dayActionDesc: 'تصمیم‌گیری در خواب نیم‌روز بعد از دفاعیه‌های ۳۰ ثانیه‌ای برای آغاز رأی‌گیری اجباری خروج با اعلام ساید.',
    strategyTips: ['استعلام هم‌سایدی هویت دقیق را لو نمی‌دهد فقط می‌گوید هم‌تیم هستند یا نه.', 'اگر در شب شات شوید، بازپرسی روز بعد لغو نمی‌شود.']
  },
  MOHAQEQ: {
    key: 'MOHAQEQ',
    nameFa: 'محقق',
    nameEn: 'Researcher / Hunter',
    side: 'CITIZEN',
    color: '#c084fc',
    shortDesc: 'کاشف اطلاعات پنهان شب؛ مصون در برابر شات اشتباه به رئیس مافیا',
    fullDesc: 'نخستین نقشی است که در فاز شب بیدار می‌شود و استعلام یا ردگیری خود را انجام می‌دهد.',
    nightActionDesc: 'اولین بیداری شب برای انجام استعلام و بررسی حرکات بازی.',
    dayActionDesc: 'آوردن فکت‌های منطقی به دادگاه شهر بدون لو دادن زودهنگام هویت.',
    strategyTips: ['تحلیل‌های شبانه خود را با استدلال‌های منطقی در روز مطرح کنید.']
  },
  DETECTIVE: {
    key: 'DETECTIVE',
    nameFa: 'کارآگاه',
    nameEn: 'Detective',
    side: 'CITIZEN',
    color: '#06b6d4',
    shortDesc: 'استعلام‌گیرنده مافیا در شب (استعلام رئیس همواره منفی است)',
    fullDesc: 'هر شب بیدار شده و استعلام یک بازیکن را می‌گیرد. پاسخ برای مافیا مثبت و برای شهروندان و رئیس مافیا منفی است.',
    nightActionDesc: 'نشان دادن یک بازیکن برای دریافت پاسخ لایک (مافیا) یا دیس‌لایک (شهروند/رئیس).',
    dayActionDesc: 'جهت‌دهی هوشمندانه به آرای شهر بدون افشای بی‌مورد نقش خود.',
    strategyTips: ['استعلام منفی لزوماً شهروند پاک نیست، رئیس مافیا نیز منفی است.']
  },
  DOCTOR: {
    key: 'DOCTOR',
    nameFa: 'پزشک / دکتر',
    nameEn: 'Doctor',
    side: 'CITIZEN',
    color: '#10b981',
    shortDesc: 'نجات‌دهنده شهروندان از شلیک شبانه مافیا',
    fullDesc: 'هر شب یک بازیکن را برای نجات انتخاب می‌کند. در کل بازی ۲ بار حق نجات خود را دارد.',
    nightActionDesc: 'انتخاب یک بازیکن برای نجات از شات مافیا.',
    dayActionDesc: 'حفاظت از نقش‌های تاییدشده شهر و دفاع معقول.',
    strategyTips: ['سیوهای شخصی را برای شب‌های حساس نگه دارید.']
  },
  SNIPER: {
    key: 'SNIPER',
    nameFa: 'تک‌تیرانداز',
    nameEn: 'Sniper',
    side: 'CITIZEN',
    color: '#f59e0b',
    shortDesc: 'قدرت شلیک مرگبار شهر به مافیا در شب',
    fullDesc: 'دارای ۲ تیر جنگی است. شلیک به اعضای مافیا باعث حذف آنها می‌شود و شلیک به رئیس یا شهروند بی‌اثر است یا می‌سوزد.',
    nightActionDesc: 'شلیک مستقیم شبانه به مظنونان مافیا.',
    dayActionDesc: 'رصد رفتارهای مشکوک روز برای انتخاب تارگت مطمئن شب.',
    strategyTips: ['فقط در صورت اطمینان بالا شلیک کنید تا تیر خود را نسوزانید.']
  },
  GUNSMITH: {
    key: 'GUNSMITH',
    nameFa: 'تفنگ‌دار',
    nameEn: 'Gunsmith',
    side: 'CITIZEN',
    color: '#818cf8',
    shortDesc: 'توزیع‌کننده تفنگ جنگی و مشقی در شب',
    fullDesc: 'در شب به یک نفر تفنگ جنگی یا مشقی اعطا می‌کند تا آن شخص در فاز روز شلیک کند.',
    nightActionDesc: 'تعیین بازیکن و انتخاب تیر جنگی یا مشقی.',
    dayActionDesc: 'مشاهده اثر شلیک تفنگ در روز.',
    strategyTips: ['تفنگ جنگی را به مطمئن‌ترین شهروند بدهید.']
  },
  CITIZEN_SIMPLE: {
    key: 'CITIZEN_SIMPLE',
    nameFa: 'شهروند ساده',
    nameEn: 'Simple Citizen',
    side: 'CITIZEN',
    color: '#94a3b8',
    shortDesc: 'ستون‌های اصلی شهر با قدرت تحلیل، استدلال و رأی‌دهی',
    fullDesc: 'در شب قابلیتی ندارد اما در روز با استدلال و اجماع و رأی‌گیری شهر را به پیروزی می‌رساند.',
    nightActionDesc: 'خواب شبانه.',
    dayActionDesc: 'تارگت‌زنی دقیق، چالش گرفتن و دفاع در صورت ورود به دفاعیه.',
    strategyTips: ['شهروند ساده هیچ هراسی از بیان حقایق ندارد چون نقش مخفی ندارد!']
  },

  // === TAKAVER SCENARIO ROLES ===
  TAKAVER: {
    key: 'TAKAVER',
    nameFa: 'تکاور',
    nameEn: 'Commando / Ranger',
    side: 'CITIZEN',
    color: '#14b8a6',
    shortDesc: 'ضدحمله شلیک شب مافیا؛ پاسخ فوری با شلیک به قاتل',
    fullDesc: 'اگر تکاور در فاز شب مورد شات مافیا قرار بگیرد، بلافاصله توسط گرداننده بیدار شده و به او حق شلیک به یکی از بازیکنان داده می‌شود. اگر مافیا را بزند، مافیا حذف می‌شود. اگر به شهروند بزند خودش هم حذف می‌شود، و اگر به رئیس مافیا بزند هیچ‌کس حذف نمی‌شود.',
    nightActionDesc: 'تنها در صورتی بیدار می‌شود که در آن شب مافیا به او شلیک کرده باشد.',
    dayActionDesc: 'بازی با شجاعت در روز و به جان خریدن شلیک شب مافیا برای به دام انداختن آنها.',
    strategyTips: ['کاری کنید مافیا شما را هدف قرار دهد تا بتوانید در شب شلیک انتقام را اجرا کنید.']
  },
  NEGAHBAN: {
    key: 'NEGAHBAN',
    nameFa: 'نگهبان',
    nameEn: 'Guardian / Sentry',
    side: 'CITIZEN',
    color: '#3b82f6',
    shortDesc: 'محافظ شهروندان و نگهبان شبانه در برابر تعرضات',
    fullDesc: 'نگهبان هر شب بیدار شده و می‌تواند یک نفر را محافظت کند تا از اقدامات منفی مصون بماند.',
    nightActionDesc: 'انتخاب یک بازیکن برای محافظت در شب.',
    dayActionDesc: 'شناسایی خطوط بازی و یاری به کارآگاه و تکاور.',
    strategyTips: ['نقش‌های افشاشده شهر را در اولویت محافظت قرار دهید.']
  },
  ZEREHPOOSH: {
    key: 'ZEREHPOOSH',
    nameFa: 'زره‌پوش (روئین‌تن)',
    nameEn: 'Armored / Bulletproof',
    side: 'CITIZEN',
    color: '#0284c7',
    shortDesc: 'دارای یک جان اضافه در برابر شلیک اول یا خروج اول',
    fullDesc: 'زره‌پوش یک زره محافظ دارد. بار اولی که در شب شات بخورد یا در روز رأی خروج بیاورد زره‌اش می‌افتد و در بازی باقی می‌ماند.',
    nightActionDesc: 'مصونیت خودکار از اولین شلیک مافیا.',
    dayActionDesc: 'بازی تهاجمی و کشف مافیا با تکیه بر داشتن زره دفاعی.',
    strategyTips: ['با شجاعت بازی کنید تا شلیک مافیا روی زره شما بسوزد.']
  },
  GROGANGIR: {
    key: 'GROGANGIR',
    nameFa: 'گروگان‌گیر (ماتادور)',
    nameEn: 'Hostage Taker / Matador',
    side: 'MAFIA',
    color: '#e11d48',
    shortDesc: 'قفل‌کننده توانایی شبانه شهروندان و تکاور',
    fullDesc: 'هر شب یک بازیکن را به گروگان می‌گیرد. توانایی آن بازیکن در آن شب کاملاً بی‌اثر می‌شود (مثلاً استعلام کارآگاه یا سیو دکتر یا شلیک تکاور).',
    nightActionDesc: 'انتخاب هدف برای بی‌اثر کردن قابلیت شبانه او.',
    dayActionDesc: 'گمراه کردن تصمیمات شهر و پوشش تیم مافیا.',
    strategyTips: ['کارآگاه و دکتر را شناسایی کنید و قابلیت شبانه آنها را بسوزانید.']
  },

  // === NAMAYANDEH SCENARIO ROLES ===
  SARBAZ: {
    key: 'SARBAZ',
    nameFa: 'سرباز (شهروند سرباز)',
    nameEn: 'Soldier (Sarbaz)',
    side: 'CITIZEN',
    color: '#10b981',
    shortDesc: 'دارای یک تیر جنگی برای شلیک؛ در صورت هک توسط هکر مافیا، تیر به هدف نمی‌رسد',
    fullDesc: 'سرباز از اعضای کلیدی تیم شهروند است و دارای یک تیر جنگی می‌باشد. او می‌تواند شلیک خود را به یک مظنون مافیا انجام دهد. اما اگر هکر مافیا سرباز را شناسایی و هک کرده باشد، شلیک سرباز به هدف اصابت نخواهد کرد.',
    nightActionDesc: 'آماده‌سازی یا شلیک تیر جنگی به مظنونین.',
    dayActionDesc: 'شلیک به مافیای قطعی و دفاع از حقایق شهر.',
    strategyTips: ['مراقب باشید هویت‌تان لو نرود تا هکر قابلیت تیر شما را نسوزاند.']
  },
  NAMAYANDEH: {
    key: 'NAMAYANDEH',
    nameFa: 'نماینده',
    nameEn: 'Representative',
    side: 'CITIZEN',
    color: '#0284c7',
    shortDesc: 'عنوان منتخب شهروندان در فرآیند انتخاب نماینده در روز اول',
    fullDesc: 'نماینده نقشی فرآیندی در بازی است که توسط بازیکنان در روز اول انتخاب می‌شود و دون مافیا می‌تواند با رأی خیانت روی آرای نماینده اثر بگذارد.',
    nightActionDesc: 'رصد تصمیمات شبانه.',
    dayActionDesc: 'اعمال اثر رأی‌گیری و هدایت شهر.',
    strategyTips: ['از نفوذ خود برای نجات شهروندان بهره ببرید.']
  },
  RAHNAMA: {
    key: 'RAHNAMA',
    nameFa: 'راهنما',
    nameEn: 'Guide',
    side: 'CITIZEN',
    color: '#8b5cf6',
    shortDesc: 'استعلام‌گیرنده ارتباطی؛ اگر شهروند را انتخاب کند استعلام می‌گیرد',
    fullDesc: 'راهنما یک نفر را در شب انتخاب می‌کند. اگر آن شخص شهروند باشد بیدار می‌شود و مثل کارآگاه استعلام می‌گیرد. اگر مافیا باشد، مافیا بیدار شده و راهنما را می‌شناسد. نمی‌تواند ۲ شب متوالی یک نفر را انتخاب کند.',
    nightActionDesc: 'انتخاب یک بازیکن در شب برای برقراری پیوند هدایت یا استعلام.',
    dayActionDesc: 'بررسی رفتارهای روز برای اطمینان از شهروند بودن هدف قبل از انتخاب شب.',
    strategyTips: ['دقت کنید هدف مافیا نباشد تا هویت شما لو نرود.']
  },
  MINGOZAR: {
    key: 'MINGOZAR',
    nameFa: 'مین‌گذار',
    nameEn: 'Minelayer',
    side: 'CITIZEN',
    color: '#d97706',
    shortDesc: 'تله انفجاری دفاعی؛ در صورت شات هدف، مافیا نیز تلفات می‌دهد',
    fullDesc: 'یک بار در بازی جلوی خانه یک نفر مین می‌گذارد. اگر مافیا به آن شخص شلیک کند مین منفجر شده و تیم مافیا باید یک فدایی بدهد تا همراه او کشته شود.',
    nightActionDesc: 'انتخاب هدف برای استقرار مین دفاعی.',
    dayActionDesc: 'هدایت بازی به گونه‌ای که مافیا به هدف مین‌گذاری شده شلیک کند.',
    strategyTips: ['مین را روی بازیکنی بگذارید که مطمئن هستید شات امشب مافیاست.']
  },
  VAKIL: {
    key: 'VAKIL',
    nameFa: 'وکیل',
    nameEn: 'Lawyer (Vakil)',
    side: 'CITIZEN',
    color: '#6366f1',
    shortDesc: 'مصون‌کننده قطعی یک شهروند از رفتن به دفاعیه در روز بعد',
    fullDesc: 'یک بار در طول بازی در شب بیدار می‌شود و یک نفر را انتخاب می‌کند. آن شخص در روز بعد حتی با داشتن حد نصاب رأی وارد دفاعیه نمی‌شود.',
    nightActionDesc: 'انتخاب فرد برای اعطای مصونیت از دفاعیه روز بعد.',
    dayActionDesc: 'جلوگیری از خروج ناعادلانه شهروندان کلیدی.',
    strategyTips: ['وکالت را برای زمانی که شهر به اشتباه روی یک شهروند متحد شده به کار ببرید.']
  },
  MOHAFIZ: {
    key: 'MOHAFIZ',
    nameFa: 'محافظ',
    nameEn: 'Protector',
    side: 'CITIZEN',
    color: '#059669',
    shortDesc: 'محافظ جان بازیکنان در برابر ترور یاغی و خطرات روزانه',
    fullDesc: 'محافظ از یک بازیکن در برابر ترور و شلیک‌های پیش از رأی‌گیری دفاع می‌کند.',
    nightActionDesc: 'انتخاب بازیکن هدف برای چتر حمایتی.',
    dayActionDesc: 'خنثی‌سازی ترور یاغی در صورت انتخاب درست.',
    strategyTips: ['همواره از نماینده و دکتر بازی حفاظت کنید.']
  },
  DON_MAFIA: {
    key: 'DON_MAFIA',
    nameFa: 'دن مافیا',
    nameEn: 'Don (Mafia Boss)',
    side: 'MAFIA',
    color: '#ef4444',
    shortDesc: 'رئیس تیم مافیا با استعلام منفی و قابلیت رأی خیانت',
    fullDesc: 'استعلام کارآگاه برای او منفی است. او می‌تواند با «رأی خیانت» رأی تارگت یکی از نماینده‌ها را ۱ واحد کم یا زیاد کند.',
    nightActionDesc: 'تصمیم‌گیری شات شب مافیا و مدیریت رأی خیانت.',
    dayActionDesc: 'تغییر موازنه آرا و حفظ نقاب شهروندی.',
    strategyTips: ['از رأی خیانت در رأی‌گیری‌های برابر استفاده کنید تا یار خود را نجات دهید.']
  },
  YAGHI: {
    key: 'YAGHI',
    nameFa: 'یاغی (ترور)',
    nameEn: 'Rebel / Terror',
    side: 'MAFIA',
    color: '#e11d48',
    shortDesc: 'نفر دوم مافیا؛ در صورت خروج رئیس تبدیل به ترور می‌شود',
    fullDesc: 'در صورت خروج رئیس مافیا یا هکر، یاغی تبدیل به ترور شده و قبل از رأی‌گیری روز می‌تواند یک نفر را مستقیماً ترور و از بازی خارج کند.',
    nightActionDesc: 'بیدار شدن با تیم مافیا.',
    dayActionDesc: 'اجرای عملیات ترور غافلگیرکننده قبل از شروع رأی‌گیری روز.',
    strategyTips: ['نقش‌های موثر شهر مثل نماینده یا دکتر را ترور کنید.']
  },
  HACKER: {
    key: 'HACKER',
    nameFa: 'هکر',
    nameEn: 'Hacker',
    side: 'MAFIA',
    color: '#f43f5e',
    shortDesc: 'از بین برنده توانایی شبانه بازیکنان مانند نجات دکتر',
    fullDesc: 'هر شب می‌تواند توانایی یک نفر را هک و کاملاً از کار بیندازد (مثلاً مانع نجات دکتر شود).',
    nightActionDesc: 'انتخاب هدف برای هک سیستم و مسدود کردن توانایی او.',
    dayActionDesc: 'ایجاد شک و تردید در گزارش‌های صبحگاهی شهر.',
    strategyTips: ['دکتر یا راهنما را هک کنید تا شات شب مافیا بدون مانع عمل کند.']
  },

  // === MAFIA CORE ROLES ===
  MAFIA_BOSS: {
    key: 'MAFIA_BOSS',
    nameFa: 'رئیس مافیا (پدرخوانده)',
    nameEn: 'Mafia Boss / Godfather',
    side: 'MAFIA',
    color: '#ef4444',
    shortDesc: 'رهبر مافیا با حق شلیک شب، استعلام منفی و سوداگری',
    fullDesc: 'فرمانده تیم مافیا. استعلام کارآگاه برای او منفی است و تیر تک‌تیرانداز رویش اثر ندارد. قابلیت سوداگری (فدا کردن یار برای جذب شهروند) را دارد.',
    nightActionDesc: 'شلیک شب مافیا و مدیریت قابلیت‌های ویژه.',
    dayActionDesc: 'فرماندهی افکار عمومی در روز با چهره کاملاً موجه و شهروندی.',
    strategyTips: ['استعلام منفی بهترین سپر شما در روز است.']
  },
  SHEYAD: {
    key: 'SHEYAD',
    nameFa: 'شیاد',
    nameEn: 'Trickster (Sheyad)',
    side: 'MAFIA',
    color: '#fb7185',
    shortDesc: 'فریب‌دهنده کارآگاه و برهم‌زننده استعلام‌های شهر',
    fullDesc: 'هر شب بیدار شده و یک نفر را انتخاب می‌کند. اگر کارآگاه را بزند تمام استعلام‌های آن شب کارآگاه منفی می‌شود.',
    nightActionDesc: 'انتخاب هدف برای فریب استعلام یا ایجاد اخلال.',
    dayActionDesc: 'شبهه‌افکنی در استعلام‌های شهر.',
    strategyTips: ['کارآگاه احتمالی را حدس بزنید و استعلامش را معکوس کنید.']
  },
  NATO: {
    key: 'NATO',
    nameFa: 'ناتو',
    nameEn: 'Nato',
    side: 'MAFIA',
    color: '#ea580c',
    shortDesc: 'حدس دقیق نقش شهروند در شب برای قتل قطعی حتی با سیو',
    fullDesc: 'یک بار در بازی می‌تواند نقش دقیق یک شهروند را حدس بزند. در صورت حدس صحیح، آن شخص بدون اثر سیو دکتر کشته می‌شود.',
    nightActionDesc: 'اعلام نام بازیکن و نقش حدس زده شده به گرداننده.',
    dayActionDesc: 'شنیدن فکت‌ها برای کشف نقش‌های ویژه شهروندان.',
    strategyTips: ['شلیک ناتو را تا زمان یقین روی نقش‌های حساس مثل بازپرس یا دکتر نگه دارید.']
  },
  MAFIA_SIMPLE: {
    key: 'MAFIA_SIMPLE',
    nameFa: 'مافیای ساده',
    nameEn: 'Simple Mafia',
    side: 'MAFIA',
    color: '#b91c1c',
    shortDesc: 'سرباز تیم مافیا، یار کمکی در اجماع شلیک و پوشش تیم',
    fullDesc: 'در شب با تیم مافیا بیدار می‌شود و در تصمیم‌گیری شات و رأی‌گیری‌های روز تیم خود را همراهی می‌کند.',
    nightActionDesc: 'بیدار شدن با تیم مافیا.',
    dayActionDesc: 'رأی‌سازی و فداکاری در صورت نیاز برای موفقیت مافیا.',
    strategyTips: ['در صورت نیاز قربانی سوداگری شوید تا یار تازه به تیم بپیوندد.']
  }
};

// Aliases for compatibility
export const BAZPORS_ROLES = ALL_ROLES;

export const SCENARIOS: Record<ScenarioType, ScenarioInfo> = {
  BAZPORS: {
    type: 'BAZPORS',
    nameFa: 'سناریو بازپرس',
    nameEn: 'Investigator Scenario',
    description: 'سناریوی جذاب وایت‌شو با حضور بازپرس، محقق، دادگاه بازپرسی ۳۰ ثانیه‌ای، خواب نیم‌روز و اعلام ساید خروج',
    availablePlayerCounts: [10, 11, 12, 13, 15],
    presets: {
      10: {
        BAZPORS: 1, MOHAQEQ: 1, DETECTIVE: 1, DOCTOR: 1, CITIZEN_SIMPLE: 3,
        MAFIA_BOSS: 1, SHEYAD: 1, MAFIA_SIMPLE: 1, SNIPER: 0, GUNSMITH: 0, NATO: 0,
        TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0,
        RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      },
      11: {
        BAZPORS: 1, MOHAQEQ: 1, DETECTIVE: 1, DOCTOR: 1, CITIZEN_SIMPLE: 4,
        MAFIA_BOSS: 1, SHEYAD: 1, MAFIA_SIMPLE: 1, SNIPER: 0, GUNSMITH: 0, NATO: 0,
        TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0,
        RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      },
      12: {
        BAZPORS: 1, MOHAQEQ: 1, DETECTIVE: 1, DOCTOR: 1, SNIPER: 1, CITIZEN_SIMPLE: 4,
        MAFIA_BOSS: 1, SHEYAD: 1, MAFIA_SIMPLE: 1, GUNSMITH: 0, NATO: 0,
        TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0,
        RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      },
      13: {
        BAZPORS: 1, MOHAQEQ: 1, DETECTIVE: 1, DOCTOR: 1, SNIPER: 1, CITIZEN_SIMPLE: 4,
        MAFIA_BOSS: 1, SHEYAD: 1, NATO: 1, MAFIA_SIMPLE: 1, GUNSMITH: 0,
        TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0,
        RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      },
      15: {
        BAZPORS: 1, MOHAQEQ: 1, DETECTIVE: 1, DOCTOR: 1, SNIPER: 1, GUNSMITH: 1, CITIZEN_SIMPLE: 5,
        MAFIA_BOSS: 1, SHEYAD: 1, NATO: 1, MAFIA_SIMPLE: 1,
        TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0,
        RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      }
    }
  },

  TAKAVER: {
    type: 'TAKAVER',
    nameFa: 'سناریو تکاور',
    nameEn: 'Commando (Takaver) Scenario',
    description: 'سناریوی مهیج شهروند و مافیا با حضور تکاور (شلیک ضدحمله شب)، تفنگدار، زره‌پوش، نگهبان و گروگانگیر',
    availablePlayerCounts: [10, 12, 13],
    presets: {
      10: {
        TAKAVER: 1, DETECTIVE: 1, DOCTOR: 1, ZEREHPOOSH: 1, CITIZEN_SIMPLE: 3,
        MAFIA_BOSS: 1, GROGANGIR: 1, MAFIA_SIMPLE: 1,
        BAZPORS: 0, MOHAQEQ: 0, SNIPER: 0, GUNSMITH: 0, SHEYAD: 0, NATO: 0,
        NEGAHBAN: 0, NAMAYANDEH: 0, RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      },
      12: {
        TAKAVER: 1, DETECTIVE: 1, DOCTOR: 1, GUNSMITH: 1, ZEREHPOOSH: 1, NEGAHBAN: 1, CITIZEN_SIMPLE: 2,
        MAFIA_BOSS: 1, NATO: 1, GROGANGIR: 1, MAFIA_SIMPLE: 1,
        BAZPORS: 0, MOHAQEQ: 0, SNIPER: 0, SHEYAD: 0, NAMAYANDEH: 0,
        RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      },
      13: {
        TAKAVER: 1, DETECTIVE: 1, DOCTOR: 1, GUNSMITH: 1, ZEREHPOOSH: 1, NEGAHBAN: 1, SNIPER: 1, CITIZEN_SIMPLE: 2,
        MAFIA_BOSS: 1, NATO: 1, GROGANGIR: 1, MAFIA_SIMPLE: 1,
        BAZPORS: 0, MOHAQEQ: 0, SHEYAD: 0, NAMAYANDEH: 0,
        RAHNAMA: 0, MINGOZAR: 0, VAKIL: 0, MOHAFIZ: 0, DON_MAFIA: 0, YAGHI: 0, HACKER: 0
      }
    }
  },

  NAMAYANDEH: {
    type: 'NAMAYANDEH',
    nameFa: 'سناریو نماینده',
    nameEn: 'Representative (Namayandeh) Scenario',
    description: 'سناریوی مهیج وایت‌شو با حضور راهنما، مین‌گذار، وکیل، محافظ، دکتر، سرباز، دون مافیا (با رأی خیانت)، یاغی (ترور)، هکر و ناتو',
    availablePlayerCounts: [10, 12, 13],
    presets: {
      10: {
        RAHNAMA: 1, MINGOZAR: 1, DOCTOR: 1, VAKIL: 1, MOHAFIZ: 1, CITIZEN_SIMPLE: 2,
        DON_MAFIA: 1, YAGHI: 1, HACKER: 1,
        SARBAZ: 0, NATO: 0, BAZPORS: 0, MOHAQEQ: 0, DETECTIVE: 0, SNIPER: 0, GUNSMITH: 0,
        MAFIA_BOSS: 0, SHEYAD: 0, MAFIA_SIMPLE: 0, TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0
      },
      12: {
        RAHNAMA: 1, MINGOZAR: 1, DOCTOR: 1, VAKIL: 1, MOHAFIZ: 1, SARBAZ: 1, CITIZEN_SIMPLE: 2,
        DON_MAFIA: 1, YAGHI: 1, HACKER: 1, NATO: 1,
        BAZPORS: 0, MOHAQEQ: 0, DETECTIVE: 0, SNIPER: 0, GUNSMITH: 0, MAFIA_BOSS: 0,
        SHEYAD: 0, MAFIA_SIMPLE: 0, TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0
      },
      13: {
        RAHNAMA: 1, MINGOZAR: 1, DOCTOR: 1, VAKIL: 1, MOHAFIZ: 1, SARBAZ: 1, CITIZEN_SIMPLE: 3,
        DON_MAFIA: 1, YAGHI: 1, HACKER: 1, NATO: 1,
        BAZPORS: 0, MOHAQEQ: 0, DETECTIVE: 0, SNIPER: 0, GUNSMITH: 0, MAFIA_BOSS: 0,
        SHEYAD: 0, MAFIA_SIMPLE: 0, TAKAVER: 0, NEGAHBAN: 0, ZEREHPOOSH: 0, GROGANGIR: 0, NAMAYANDEH: 0
      }
    }
  }
};
