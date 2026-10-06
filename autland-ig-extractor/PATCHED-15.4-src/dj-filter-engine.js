/**
 * DJ / Artist Lead Scoring Engine — Autland IG Extractor v2.4.1
 * Runs entirely in the extension (no external API calls).
 */
(function (global) {
  "use strict";

  var POSITIVE_KEYWORDS = [
    "dj", "producer", "artist", "music", "afro house", "melodic",
    "tech house", "deep house", "house music", "booking", "bookings",
    "label", "record label", "spotify", "soundcloud", "beatport",
    "traxsource", "management", "official", "live set", "radio show",
    "remix", "release", "festival", "electronic", "edm", "techno",
    "minimal", "garage", "jungle", "drum and bass", "dnb", "bass",
    "mix", "mixtape", "ep release", "vinyl", "turntablist", "selector",
    "musician", "vocalist", "singer", "rapper", "mc ", "band",
    "music producer", "beatmaker", "instrumentalist"
  ];

  var NEGATIVE_KEYWORDS = [
    "meme", "shop", "store", "fashion", "bet", "crypto", "motivation",
    "personal blog", "fan page", "comedy", "quotes", "news", "football",
    "beauty", "makeup", "trading", "forex", "investment", "real estate",
    "fitness", "gym", "food", "restaurant", "travel", "photography",
    "lifestyle", "influencer", "model", "gaming", "sport", "soccer",
    "basketball", "nba", "nfl", "cars", "auto", "dating", "adult"
  ];

  var MUSIC_LINK_PATTERNS = [
    "soundcloud.com", "spotify.com", "open.spotify", "beatport.com",
    "traxsource.com", "bandcamp.com", "mixcloud.com", "audiomack.com",
    "apple.co", "music.apple", "tidal.com", "deezer.com",
    "linktr.ee", "bio.link", "linkin.bio"
  ];

  var DJ_CATEGORIES = [
    "Musician/Band", "Music producer", "DJ", "Artist", "Record Label",
    "Music Award", "Concert", "Event", "Arts & Entertainment"
  ];

  var CLASSES = {
    DJ: "DJ",
    PRODUCER: "Producer",
    LABEL: "Label",
    PROMOTER: "Promoter",
    EVENT: "Event",
    ARTIST: "Artist",
    UNKNOWN: "Unknown"
  };

  function lc(str) {
    return (str || "").toLowerCase();
  }

  function containsAny(text, keywords) {
    var t = lc(text);
    for (var i = 0; i < keywords.length; i++) {
      if (t.indexOf(keywords[i]) !== -1) return true;
    }
    return false;
  }

  function countMatches(text, keywords) {
    var t = lc(text), count = 0;
    for (var i = 0; i < keywords.length; i++) {
      if (t.indexOf(keywords[i]) !== -1) count++;
    }
    return count;
  }

  function hasMusicLink(url) {
    var u = lc(url || "");
    for (var i = 0; i < MUSIC_LINK_PATTERNS.length; i++) {
      if (u.indexOf(MUSIC_LINK_PATTERNS[i]) !== -1) return true;
    }
    return false;
  }

  function classify(user) {
    var bio = lc(user.bio || "");
    var name = lc(user.fullName || "") + " " + lc(user.userName || "");
    var combined = bio + " " + name;
    var cat = lc(user.category || "");

    if (bio.indexOf("dj") !== -1 || name.indexOf("dj") !== -1) return CLASSES.DJ;
    if (cat.indexOf("dj") !== -1) return CLASSES.DJ;
    if (bio.indexOf("producer") !== -1 || bio.indexOf("beatmaker") !== -1) return CLASSES.PRODUCER;
    if (cat === "music producer" || cat.indexOf("producer") !== -1) return CLASSES.PRODUCER;
    if (bio.indexOf("label") !== -1 || cat.indexOf("label") !== -1) return CLASSES.LABEL;
    if (bio.indexOf("promoter") !== -1 || bio.indexOf("booking") !== -1) return CLASSES.PROMOTER;
    if (bio.indexOf("festival") !== -1 || bio.indexOf("event") !== -1 || cat.indexOf("event") !== -1) return CLASSES.EVENT;
    if (containsAny(combined, ["artist", "musician", "singer", "vocalist", "rapper", "mc", "band"])) return CLASSES.ARTIST;
    return CLASSES.UNKNOWN;
  }

  function score(user) {
    var points = 0;
    var log = [];

    var bio = lc(user.bio || "");
    var name = lc(user.fullName || "") + " " + lc(user.userName || "");
    var combined = bio + " " + name;
    var followers = parseInt(user.followers) || 0;
    var externalUrl = user.externalUrl || "";
    var isVerified = user.isVerified === "YES";
    var isPrivate = user.isPrivate === "YES";
    var isBusiness = user.isBusiness === "YES";
    var category = lc(user.category || "");

    // --- Positive signals ---

    if (bio.indexOf("dj") !== -1 || name.indexOf("dj") !== -1) {
      points += 35; log.push("+35 DJ in bio/name");
    }
    if (bio.indexOf("producer") !== -1) {
      points += 30; log.push("+30 producer in bio");
    }
    if (bio.indexOf("booking") !== -1 || bio.indexOf("bookings") !== -1) {
      points += 20; log.push("+20 booking in bio");
    }
    if (hasMusicLink(externalUrl)) {
      points += 25; log.push("+25 music link in URL");
    }
    if (hasMusicLink(bio)) {
      points += 15; log.push("+15 music link in bio");
    }
    if (followers >= 5000 && followers <= 500000) {
      points += 20; log.push("+20 followers in DJ range");
    } else if (followers >= 1000 && followers < 5000) {
      points += 8; log.push("+8 followers 1k-5k");
    }
    if (isVerified) {
      points += 15; log.push("+15 verified account");
    }
    if (isBusiness) {
      points += 10; log.push("+10 business account");
    }

    var genreCount = countMatches(combined, [
      "afro house", "tech house", "deep house", "melodic", "techno",
      "house music", "electronic", "edm", "drum and bass", "dnb"
    ]);
    if (genreCount > 0) {
      var genreScore = Math.min(genreCount * 12, 25);
      points += genreScore; log.push("+" + genreScore + " genre keywords");
    }

    var extraMusic = countMatches(combined, [
      "remix", "release", "radio show", "live set", "festival",
      "label", "record label", "soundcloud", "beatport", "traxsource",
      "spotify", "vinyl", "selector", "turntablist", "mix", "ep"
    ]);
    if (extraMusic > 0) {
      var extraScore = Math.min(extraMusic * 5, 20);
      points += extraScore; log.push("+" + extraScore + " music activity keywords");
    }

    for (var i = 0; i < DJ_CATEGORIES.length; i++) {
      if (category.indexOf(lc(DJ_CATEGORIES[i])) !== -1) {
        points += 15; log.push("+15 music category");
        break;
      }
    }

    // --- Negative signals ---

    if (containsAny(combined, NEGATIVE_KEYWORDS)) {
      points -= 40; log.push("-40 negative keywords");
    }
    if (isPrivate) {
      points -= 15; log.push("-15 private account");
    }
    if (followers < 300) {
      points -= 20; log.push("-20 very low followers");
    }
    if (!user.avatar || user.avatar === "") {
      points -= 10; log.push("-10 no avatar");
    }

    var finalScore = Math.max(0, Math.min(100, points));

    console.log(
      "[DJFilter] @" + (user.userName || "?") +
      " score=" + finalScore + " | " + log.join(", ")
    );

    return finalScore;
  }

  function processUser(user) {
    var s = score(user);
    var cl = classify(user);
    return Object.assign({}, user, {
      djScore: s,
      djClass: cl,
      isHotLead: s >= 60
    });
  }

  function filterList(list, options) {
    options = options || {};
    var djOnly = options.djOnly || false;
    var minScore = options.minScore || 0;

    return list.filter(function (user) {
      if (!user.loaded) return false;
      var s = typeof user.djScore === "number" ? user.djScore : 0;
      if (minScore > 0 && s < minScore) return false;
      if (djOnly && user.djClass === CLASSES.UNKNOWN && s < 30) return false;
      return true;
    });
  }

  global.DJFilter = {
    score: score,
    classify: classify,
    processUser: processUser,
    filterList: filterList,
    CLASSES: CLASSES
  };

})(typeof window !== "undefined" ? window : this);
