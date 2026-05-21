// King's on-screen appearances. He has been in dozens of adaptations of
// his own work + a few outside projects. This is a curated set.

export type Cameo = {
  year: number;
  film: string;          // film title
  role: string;          // character he played
  description: string;   // a one-liner
  film_imdb?: string;
};

export const cameos: Cameo[] = [
  { year: 1981, film: "Knightriders",      role: "Hoagie Man",                  description: "Romero's medieval-jousting-on-motorcycles film. King is the guy at the rally eating a hoagie.",        film_imdb: "tt0082643" },
  { year: 1982, film: "Creepshow",         role: "Jordy Verrill",               description: "Title role in the second segment — \"The Lonesome Death of Jordy Verrill\". A meteor, a vine, a tragedy.", film_imdb: "tt0083767" },
  { year: 1985, film: "Cat's Eye",         role: "Pedestrian (uncredited)",      description: "Quick walk-on in his own screenplay's framing.",                                                            film_imdb: "tt0088889" },
  { year: 1986, film: "Maximum Overdrive", role: "Man at Cashpoint",            description: "The ATM that calls him an asshole. Asshole.",                                                                film_imdb: "tt0091499" },
  { year: 1989, film: "Pet Sematary",      role: "Minister at funeral",          description: "Speaks one line at Missy Dandridge's funeral.",                                                              film_imdb: "tt0098084" },
  { year: 1990, film: "IT (miniseries)",   role: "Man at bus stop (uncredited)", description: "Walks past Mike Hanlon in the Derry bus station shot.",                                                       film_imdb: "tt0099864" },
  { year: 1991, film: "Golden Years",      role: "Bus driver",                   description: "King's own CBS miniseries (he wrote it). Cameos as a bus driver.",                                            film_imdb: "tt0101101" },
  { year: 1992, film: "Sleepwalkers",      role: "Cemetery caretaker",           description: "King wrote it; cameos in the graveyard sequence.",                                                             film_imdb: "tt0105428" },
  { year: 1992, film: "The Stand (1994)",  role: "Teddy Weizak",                description: "Survivor, member of the Free Zone — one of the few survivors with a recurring presence.",                       film_imdb: "tt0108941" },
  { year: 1993, film: "The Tommyknockers", role: "Drugstore clerk Bobby",       description: "Two-line scene at the Haven drugstore.",                                                                       film_imdb: "tt0108159" },
  { year: 1994, film: "The Langoliers",    role: "Tom Holby",                   description: "Voice cameo as a businessman over an airline phone.",                                                          film_imdb: "tt0112040" },
  { year: 1995, film: "The Stand (additional)", role: "Hometown banker",        description: "Background role added in the cut-for-runtime sequences.",                                                       film_imdb: "tt0108941" },
  { year: 1995, film: "The Mangler",        role: "(uncredited) Pizza man",     description: "Short walk-on in the Hooper adaptation.",                                                                       film_imdb: "tt0113896" },
  { year: 1996, film: "Thinner",            role: "Dr. Bangor",                  description: "King's most quoted cameo. Played the doctor who delivers the bad weight-loss news.",                            film_imdb: "tt0117895" },
  { year: 1997, film: "The Shining (miniseries)", role: "Gage Creed (bandleader)", description: "Front of the spectral 1920s dance band in the Overlook ballroom.",                                            film_imdb: "tt0118460" },
  { year: 1999, film: "Storm of the Century", role: "Lawyer's voice",           description: "Voice over a phone call near the end of the miniseries.",                                                       film_imdb: "tt0207275" },
  { year: 2001, film: "Rose Red",            role: "Pizza delivery guy",         description: "Drops off a pizza to one of the haunted-house investigators.",                                                  film_imdb: "tt0287839" },
  { year: 2003, film: "Kingdom Hospital",    role: "Johnny B. Goode",            description: "King's TV remake of Lars von Trier's series. He's the gas-station guy.",                                        film_imdb: "tt0386180" },
  { year: 2004, film: "Salem's Lot (TNT)",   role: "Father Callahan stand-in",   description: "Background in the rectory scene of the TNT remake.",                                                            film_imdb: "tt0387364" },
  { year: 2014, film: "Under the Dome",      role: "Diner customer",             description: "Season 2 premiere. Reading a paper, doesn't look up.",                                                           film_imdb: "tt2229907" },
  { year: 2017, film: "IT (Chapter One)",    role: "Pawnshop owner (deleted)",   description: "Filmed; cut for runtime. Reappears in director's cut.",                                                          film_imdb: "tt1396484" },
  { year: 2019, film: "IT Chapter Two",      role: "Antique shop owner",         description: "Sells Bill the bike. \"You used to have one just like this when you were a kid, didn't you?\"",                  film_imdb: "tt7349950" },
  { year: 2019, film: "Pet Sematary (remake)", role: "Funeral mourner",         description: "Uncredited; quick reaction shot.",                                                                                 film_imdb: "tt0846308" },
  { year: 2022, film: "Mr. Harrigan's Phone", role: "Bus passenger (uncredited)", description: "Reading on the back of the bus when Craig boards.",                                                              film_imdb: "tt15679400" },
  { year: 2024, film: "Salem's Lot",          role: "Charlie Daniels",           description: "Sits at the diner counter in the 2024 theatrical remake.",                                                       film_imdb: "tt8773366" },
];
