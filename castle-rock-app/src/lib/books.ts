// Curated bibliography. Drawn from Open Library + Wikipedia; subset of
// King's full bibliography focused on the novels people actually look
// for. Trimmed for demo legibility — full ingest would land all ~70
// novels + 200+ short stories + collections.

export type Book = {
  title: string;
  year: number;
  category: "novel" | "collection" | "novella" | "nonfiction";
  pseudonym?: "Richard Bachman";
  series?: string;
  blurb: string;
  // OpenLibrary cover ID — we render covers via the public covers API
  // when olid is present. Fallback is a plain dot.
  olid?: string;
  // ISBN-10 also works against covers.openlibrary.org
  isbn?: string;
};

export const books: Book[] = [
  { title: "Carrie",                year: 1974, category: "novel",      blurb: "The bullied prom queen with a gift, the wedding-cake reversal, the line of blood that started a career.", olid: "OL5853884M" },
  { title: "'Salem's Lot",          year: 1975, category: "novel",      blurb: "A vampire moves into a Maine town. Dracula reset in 1975 New England.",                                 olid: "OL7891867M" },
  { title: "Rage",                  year: 1977, category: "novel",      pseudonym: "Richard Bachman", blurb: "A school shooting novel King pulled from print after the real ones started lining up with it.", olid: "OL24177145M" },
  { title: "The Shining",           year: 1977, category: "novel",      blurb: "Hotel as haunted house, hotel as patriarch. \"All work and no play\" in a maze of mirrors.",            olid: "OL26439291M" },
  { title: "The Stand",             year: 1978, category: "novel",      blurb: "Plague wipes out 99%; the remnant chooses sides. King's longest, his cathedral.",                       olid: "OL26345066M" },
  { title: "Night Shift",           year: 1978, category: "collection", blurb: "The first stories collection. \"Children of the Corn\", \"Jerusalem's Lot\", \"The Mangler\".",         olid: "OL7891925M" },
  { title: "The Dead Zone",         year: 1979, category: "novel",      blurb: "A car wreck gives Johnny Smith second sight. Then he shakes hands with a politician.",                  olid: "OL26361013M" },
  { title: "The Long Walk",         year: 1979, category: "novel",      pseudonym: "Richard Bachman", blurb: "A hundred boys start walking. The last one walking wins. The losers stop walking.",      olid: "OL24211921M" },
  { title: "Firestarter",           year: 1980, category: "novel",      blurb: "An eight-year-old girl who can light the world on fire and the government that wants her.",             olid: "OL26346112M" },
  { title: "Roadwork",              year: 1981, category: "novel",      pseudonym: "Richard Bachman", blurb: "A man whose house is in the path of a highway extension. He buys explosives.",          olid: "OL24225183M" },
  { title: "Cujo",                  year: 1981, category: "novel",      blurb: "A bat bites a St. Bernard. A mother and son get trapped in a Pinto. No supernatural — just heat and rabies.", olid: "OL26426022M" },
  { title: "Danse Macabre",         year: 1981, category: "nonfiction", blurb: "King reads the horror canon and explains why we read it. His most underrated book.",                    olid: "OL7892117M" },
  { title: "The Dark Tower: The Gunslinger", year: 1982, category: "novel", series: "The Dark Tower", blurb: "\"The man in black fled across the desert, and the gunslinger followed.\" The opening line of an eight-book quest.", olid: "OL26396770M" },
  { title: "The Running Man",       year: 1982, category: "novel",      pseudonym: "Richard Bachman", blurb: "A reality show where the contestants are hunted across America. Anticipated everything.", olid: "OL24229013M" },
  { title: "Different Seasons",     year: 1982, category: "collection", blurb: "Four novellas: \"The Body\", \"Rita Hayworth\", \"Apt Pupil\", \"The Breathing Method\". Three became films.",             olid: "OL7892023M" },
  { title: "Christine",             year: 1983, category: "novel",      blurb: "Boy buys car. Car buys boy. Plymouth Fury, 1958, possessive past tense.",                                olid: "OL26390223M" },
  { title: "Pet Sematary",          year: 1983, category: "novel",      blurb: "King held this one back for years because it scared him. The ground is sour.",                          olid: "OL26449811M" },
  { title: "Cycle of the Werewolf", year: 1983, category: "novella",    blurb: "Twelve months in a small Maine town. One night a month, the wolf.",                                     olid: "OL26451044M" },
  { title: "The Talisman",          year: 1984, category: "novel",      blurb: "With Peter Straub. A boy crosses between worlds to save his mother.",                                   olid: "OL26451231M" },
  { title: "Thinner",               year: 1984, category: "novel",      pseudonym: "Richard Bachman", blurb: "A gypsy curses an overweight lawyer. The lawyer starts losing weight. Then doesn't stop.", olid: "OL24228719M" },
  { title: "Skeleton Crew",         year: 1985, category: "collection", blurb: "Includes \"The Mist\". The novella that taught a generation what \"don't look\" means.",                 olid: "OL7891950M" },
  { title: "IT",                    year: 1986, category: "novel",      blurb: "A clown in the storm drains, seven friends, two timelines, one Derry. Floats.",                          olid: "OL26425941M" },
  { title: "The Eyes of the Dragon",year: 1987, category: "novel",      blurb: "A fairy tale. Randall Flagg shows up. He shows up everywhere.",                                          olid: "OL26412006M" },
  { title: "Misery",                year: 1987, category: "novel",      blurb: "\"I'm your number one fan.\" The hobbling scene. The typewriter. The whole writing-as-captivity metaphor.", olid: "OL26411863M" },
  { title: "The Tommyknockers",     year: 1987, category: "novel",      blurb: "A buried thing in the Maine woods rewrites the town. King has called it his worst, written at his worst.", olid: "OL7891940M" },
  { title: "The Drawing of the Three", year: 1987, category: "novel",   series: "The Dark Tower", blurb: "Dark Tower II. The gunslinger draws three from doors on the beach.",            olid: "OL26396742M" },
  { title: "The Dark Half",         year: 1989, category: "novel",      blurb: "A writer's pseudonym crawls out of the grave. Sparrows fly again.",                                       olid: "OL26425927M" },
  { title: "Four Past Midnight",    year: 1990, category: "collection", blurb: "Four novellas, two great: \"The Langoliers\" and \"The Sun Dog\".",                                       olid: "OL26411917M" },
  { title: "Needful Things",        year: 1991, category: "novel",      blurb: "Leland Gaunt opens a shop in Castle Rock. Every customer wants something. The price is always the same.", olid: "OL26449762M" },
  { title: "The Waste Lands",       year: 1991, category: "novel",      series: "The Dark Tower", blurb: "Dark Tower III. Blaine the train. \"All things serve the Beam.\"",              olid: "OL26396757M" },
  { title: "Gerald's Game",         year: 1992, category: "novel",      blurb: "Handcuffed to the bed. The husband dies. Then it gets worse.",                                            olid: "OL26380122M" },
  { title: "Dolores Claiborne",     year: 1992, category: "novel",      blurb: "Single mother, eclipse, well. One long Maine monologue.",                                                 olid: "OL26425912M" },
  { title: "Insomnia",              year: 1994, category: "novel",      blurb: "An old man stops sleeping and sees auras. Dark Tower connections everywhere.",                            olid: "OL26425933M" },
  { title: "Rose Madder",           year: 1995, category: "novel",      blurb: "Battered wife runs. Buys a painting. The painting has a door.",                                          olid: "OL26411928M" },
  { title: "The Green Mile",        year: 1996, category: "novel",      blurb: "Death row in 1932. John Coffey, like the drink, only not spelled the same.",                              olid: "OL26396774M" },
  { title: "Desperation",           year: 1996, category: "novel",      blurb: "Mining town. Sheriff who isn't. Same cast as The Regulators, alternate reality.",                         olid: "OL26412017M" },
  { title: "Wizard and Glass",      year: 1997, category: "novel",      series: "The Dark Tower", blurb: "Dark Tower IV. Young Roland in Mejis. The witch in the emerald.",               olid: "OL26396750M" },
  { title: "Bag of Bones",          year: 1998, category: "novel",      blurb: "Widowed novelist. Lake house. Ghosts. King's most romantic.",                                            olid: "OL26425970M" },
  { title: "On Writing",            year: 2000, category: "nonfiction", blurb: "Half memoir, half writing manual. The most-recommended craft book of the last 25 years.",                 olid: "OL26462159M" },
  { title: "Black House",           year: 2001, category: "novel",      blurb: "With Peter Straub. The Talisman's Jack Sawyer, grown up, retired cop in Wisconsin.",                       olid: "OL26426012M" },
  { title: "Dreamcatcher",          year: 2001, category: "novel",      blurb: "Four friends. Hunting trip. Aliens that come out the wrong end.",                                         olid: "OL26425968M" },
  { title: "From a Buick 8",        year: 2002, category: "novel",      blurb: "A car that isn't a car, sitting in a state-trooper shed for thirty years.",                              olid: "OL26425980M" },
  { title: "Wolves of the Calla",   year: 2003, category: "novel",      series: "The Dark Tower", blurb: "Dark Tower V. Father Callahan from Salem's Lot walks into the story.",         olid: "OL26396740M" },
  { title: "Song of Susannah",      year: 2004, category: "novel",      series: "The Dark Tower", blurb: "Dark Tower VI. Susannah's split mind, the chap. King writes himself in.",       olid: "OL26396749M" },
  { title: "The Dark Tower",        year: 2004, category: "novel",      series: "The Dark Tower", blurb: "Dark Tower VII. The end of the quest, twice. Hile.",                            olid: "OL26396766M" },
  { title: "Cell",                  year: 2006, category: "novel",      blurb: "A pulse comes through every cell phone. The people on calls become other people.",                       olid: "OL26461976M" },
  { title: "Lisey's Story",         year: 2006, category: "novel",      blurb: "A widow looks back. Boo'ya Moon. Word-magic. King's most personal post-accident.",                       olid: "OL26411943M" },
  { title: "Duma Key",              year: 2008, category: "novel",      blurb: "An amputee paints his way out of grief on a Florida island. The paintings start moving.",                olid: "OL26461991M" },
  { title: "Under the Dome",        year: 2009, category: "novel",      blurb: "Chester's Mill, Maine, gets a clear lid over it. Then politics happens.",                                olid: "OL26425955M" },
  { title: "11/22/63",              year: 2011, category: "novel",      blurb: "A man finds a portal to 1958 in a diner pantry. He decides to stop the Kennedy assassination.",          olid: "OL26411947M" },
  { title: "Doctor Sleep",          year: 2013, category: "novel",      blurb: "Sequel to The Shining. Danny grown up, still drinking, until he meets a girl who shines harder.",         olid: "OL26462071M" },
  { title: "Joyland",               year: 2013, category: "novel",      blurb: "A carny job, a haunted ride, a Hard Case Crime paperback. Short, perfect, sad.",                          olid: "OL26462091M" },
  { title: "Mr. Mercedes",          year: 2014, category: "novel",      series: "Bill Hodges", blurb: "Retired cop Bill Hodges chases the killer who got away. Holly Gibney enters the universe.", olid: "OL27038858M" },
  { title: "Revival",               year: 2014, category: "novel",      blurb: "Faith healer, fifty-year obsession, ending people are still arguing about.",                              olid: "OL27038876M" },
  { title: "Finders Keepers",       year: 2015, category: "novel",      series: "Bill Hodges", blurb: "A reclusive author's notebooks, stolen, buried, dug up forty years later.",        olid: "OL27059881M" },
  { title: "End of Watch",          year: 2016, category: "novel",      series: "Bill Hodges", blurb: "Bill Hodges trilogy ends. Brady Hartsfield, somehow, gets his hands free.",        olid: "OL27079903M" },
  { title: "Sleeping Beauties",     year: 2017, category: "novel",      blurb: "With Owen King. Women fall asleep, the men are left to themselves. It goes how you think.",               olid: "OL27079940M" },
  { title: "The Outsider",          year: 2018, category: "novel",      blurb: "A murderer in two places at once. Holly Gibney comes back to figure it out.",                             olid: "OL27079955M" },
  { title: "Elevation",             year: 2018, category: "novella",    blurb: "A man's weight starts to drop while his body stays the same. Castle Rock, small, kind.",                  olid: "OL27079944M" },
  { title: "The Institute",         year: 2019, category: "novel",      blurb: "Kids with telepathic gifts, an off-the-books facility, a small Tennessee town.",                          olid: "OL27905117M" },
  { title: "If It Bleeds",          year: 2020, category: "collection", blurb: "Four novellas. The title story brings Holly Gibney back again.",                                          olid: "OL28133108M" },
  { title: "Later",                 year: 2021, category: "novel",      blurb: "A boy who sees the dead. Hard Case Crime imprint. Short and brutal.",                                     olid: "OL31992611M" },
  { title: "Billy Summers",         year: 2021, category: "novel",      blurb: "A hitman with a literary side. One last job. Then it changes.",                                          olid: "OL31996020M" },
  { title: "Fairy Tale",            year: 2022, category: "novel",      blurb: "A boy, a dog, a backyard shed with stairs going down. Pure portal fantasy.",                              olid: "OL34920303M" },
  { title: "Holly",                 year: 2023, category: "novel",      blurb: "Holly Gibney's own book. Two retired professors with a private menu.",                                   olid: "OL40070625M" },
  { title: "You Like It Darker",    year: 2024, category: "collection", blurb: "Twelve recent stories. Late King at peak control.",                                                      olid: "OL52196113M" },
];
