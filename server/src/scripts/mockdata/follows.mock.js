// ─────────────────────────────────────────────────────────────────────────────
// mockdata/follows.mock.js
// Follow matrix: [follower_username] → [{ target, targetAI, type, forceStatus }]
//
// Private accounts: luna_designs, ravi_thinks, mia_mindful
//   - forceStatus "accepted"  → follow request was approved
//   - forceStatus "pending"   → request is still waiting
//   - no forceStatus on a private account → defaults to "pending"
//   - public accounts default to "accepted"
// ─────────────────────────────────────────────────────────────────────────────

export const followMatrix = [
  // ── aisha_writes ──────────────────────────────────────────────────────────
  { follower: "aisha_writes", target: "marco_dev",       type: "user" },
  { follower: "aisha_writes", target: "luna_designs",    type: "user", forceStatus: "accepted" },
  { follower: "aisha_writes", target: "sara_codes",      type: "user" },
  { follower: "aisha_writes", target: "emma_explores",   type: "user" },
  { follower: "aisha_writes", target: "josh_builds",     type: "user" },
  { follower: "aisha_writes", target: "ravi_thinks",     type: "user", forceStatus: "accepted" },
  { follower: "aisha_writes", target: "phil_stoic",      type: "user" },
  { follower: "aisha_writes", target: "mia_mindful",     type: "user", forceStatus: "accepted" },
  { follower: "aisha_writes", targetAI: "Synthia",       type: "AI" },
  { follower: "aisha_writes", targetAI: "Archivist",     type: "AI" },

  // ── marco_dev ─────────────────────────────────────────────────────────────
  { follower: "marco_dev", target: "aisha_writes",       type: "user" },
  { follower: "marco_dev", target: "josh_builds",        type: "user" },
  { follower: "marco_dev", target: "kareem_hacks",       type: "user" },
  { follower: "marco_dev", target: "sara_codes",         type: "user" },
  { follower: "marco_dev", target: "devesh_data",        type: "user" },
  { follower: "marco_dev", target: "nora_pixels",        type: "user" },
  { follower: "marco_dev", targetAI: "Archivist",        type: "AI" },
  { follower: "marco_dev", targetAI: "Synthia",          type: "AI" },

  // ── luna_designs ──────────────────────────────────────────────────────────
  { follower: "luna_designs", target: "aisha_writes",    type: "user" },
  { follower: "luna_designs", target: "emma_explores",   type: "user" },
  { follower: "luna_designs", target: "ravi_thinks",     type: "user", forceStatus: "accepted" },
  { follower: "luna_designs", target: "mia_mindful",     type: "user", forceStatus: "accepted" },
  { follower: "luna_designs", target: "kai_quests",      type: "user" },
  { follower: "luna_designs", targetAI: "PixelMind",     type: "AI" },

  // ── josh_builds ───────────────────────────────────────────────────────────
  { follower: "josh_builds", target: "marco_dev",        type: "user" },
  { follower: "josh_builds", target: "kareem_hacks",     type: "user" },
  { follower: "josh_builds", target: "sara_codes",       type: "user" },
  { follower: "josh_builds", target: "ravi_thinks",      type: "user", forceStatus: "pending" },
  { follower: "josh_builds", target: "devesh_data",      type: "user" },
  { follower: "josh_builds", targetAI: "Synthia",        type: "AI" },
  { follower: "josh_builds", targetAI: "QuestBot",       type: "AI" },

  // ── sara_codes ────────────────────────────────────────────────────────────
  { follower: "sara_codes", target: "aisha_writes",      type: "user" },
  { follower: "sara_codes", target: "marco_dev",         type: "user" },
  { follower: "sara_codes", target: "luna_designs",      type: "user", forceStatus: "pending" },
  { follower: "sara_codes", target: "emma_explores",     type: "user" },
  { follower: "sara_codes", target: "nora_pixels",       type: "user" },
  { follower: "sara_codes", target: "devesh_data",       type: "user" },
  { follower: "sara_codes", targetAI: "Archivist",       type: "AI" },

  // ── ravi_thinks ───────────────────────────────────────────────────────────
  { follower: "ravi_thinks", target: "aisha_writes",     type: "user" },
  { follower: "ravi_thinks", target: "marco_dev",        type: "user" },
  { follower: "ravi_thinks", target: "sara_codes",       type: "user" },
  { follower: "ravi_thinks", target: "josh_builds",      type: "user" },
  { follower: "ravi_thinks", target: "phil_stoic",       type: "user" },
  { follower: "ravi_thinks", target: "mia_mindful",      type: "user", forceStatus: "accepted" },
  { follower: "ravi_thinks", targetAI: "Archivist",      type: "AI" },

  // ── emma_explores ─────────────────────────────────────────────────────────
  { follower: "emma_explores", target: "aisha_writes",   type: "user" },
  { follower: "emma_explores", target: "luna_designs",   type: "user", forceStatus: "accepted" },
  { follower: "emma_explores", target: "kareem_hacks",   type: "user" },
  { follower: "emma_explores", target: "josh_builds",    type: "user" },
  { follower: "emma_explores", target: "layla_lifehacks",type: "user" },
  { follower: "emma_explores", target: "kai_quests",     type: "user" },
  { follower: "emma_explores", targetAI: "PixelMind",    type: "AI" },
  { follower: "emma_explores", targetAI: "Synthia",      type: "AI" },

  // ── kareem_hacks ──────────────────────────────────────────────────────────
  { follower: "kareem_hacks", target: "marco_dev",       type: "user" },
  { follower: "kareem_hacks", target: "josh_builds",     type: "user" },
  { follower: "kareem_hacks", target: "sara_codes",      type: "user" },
  { follower: "kareem_hacks", target: "ravi_thinks",     type: "user", forceStatus: "pending" },
  { follower: "kareem_hacks", target: "devesh_data",     type: "user" },
  { follower: "kareem_hacks", targetAI: "Synthia",       type: "AI" },

  // ── zen_lifts ─────────────────────────────────────────────────────────────
  { follower: "zen_lifts", target: "layla_lifehacks",    type: "user" },
  { follower: "zen_lifts", target: "mia_mindful",        type: "user", forceStatus: "accepted" },
  { follower: "zen_lifts", target: "ravi_thinks",        type: "user", forceStatus: "pending" },
  { follower: "zen_lifts", target: "sara_codes",         type: "user" },
  { follower: "zen_lifts", target: "phil_stoic",         type: "user" },
  { follower: "zen_lifts", targetAI: "PulseAI",          type: "AI" },
  { follower: "zen_lifts", targetAI: "Archivist",        type: "AI" },

  // ── phil_stoic ────────────────────────────────────────────────────────────
  { follower: "phil_stoic", target: "ravi_thinks",       type: "user", forceStatus: "accepted" },
  { follower: "phil_stoic", target: "mia_mindful",       type: "user", forceStatus: "accepted" },
  { follower: "phil_stoic", target: "aisha_writes",      type: "user" },
  { follower: "phil_stoic", target: "kai_quests",        type: "user" },
  { follower: "phil_stoic", target: "sara_codes",        type: "user" },
  { follower: "phil_stoic", targetAI: "Archivist",       type: "AI" },

  // ── nora_pixels ───────────────────────────────────────────────────────────
  { follower: "nora_pixels", target: "kai_quests",       type: "user" },
  { follower: "nora_pixels", target: "sara_codes",       type: "user" },
  { follower: "nora_pixels", target: "marco_dev",        type: "user" },
  { follower: "nora_pixels", target: "emma_explores",    type: "user" },
  { follower: "nora_pixels", target: "luna_designs",     type: "user", forceStatus: "pending" },
  { follower: "nora_pixels", targetAI: "QuestBot",       type: "AI" },
  { follower: "nora_pixels", targetAI: "Synthia",        type: "AI" },

  // ── devesh_data ───────────────────────────────────────────────────────────
  { follower: "devesh_data", target: "sara_codes",       type: "user" },
  { follower: "devesh_data", target: "marco_dev",        type: "user" },
  { follower: "devesh_data", target: "josh_builds",      type: "user" },
  { follower: "devesh_data", target: "kareem_hacks",     type: "user" },
  { follower: "devesh_data", targetAI: "Synthia",        type: "AI" },
  { follower: "devesh_data", targetAI: "Archivist",      type: "AI" },

  // ── mia_mindful ───────────────────────────────────────────────────────────
  { follower: "mia_mindful", target: "phil_stoic",       type: "user" },
  { follower: "mia_mindful", target: "zen_lifts",        type: "user" },
  { follower: "mia_mindful", target: "layla_lifehacks",  type: "user" },
  { follower: "mia_mindful", target: "ravi_thinks",      type: "user", forceStatus: "accepted" },
  { follower: "mia_mindful", targetAI: "Archivist",      type: "AI" },
  { follower: "mia_mindful", targetAI: "PulseAI",        type: "AI" },

  // ── kai_quests ────────────────────────────────────────────────────────────
  { follower: "kai_quests", target: "nora_pixels",       type: "user" },
  { follower: "kai_quests", target: "phil_stoic",        type: "user" },
  { follower: "kai_quests", target: "mia_mindful",       type: "user", forceStatus: "pending" },
  { follower: "kai_quests", target: "sara_codes",        type: "user" },
  { follower: "kai_quests", target: "emma_explores",     type: "user" },
  { follower: "kai_quests", targetAI: "QuestBot",        type: "AI" },
  { follower: "kai_quests", targetAI: "Archivist",       type: "AI" },

  // ── layla_lifehacks ───────────────────────────────────────────────────────
  { follower: "layla_lifehacks", target: "zen_lifts",    type: "user" },
  { follower: "layla_lifehacks", target: "mia_mindful",  type: "user", forceStatus: "accepted" },
  { follower: "layla_lifehacks", target: "sara_codes",   type: "user" },
  { follower: "layla_lifehacks", target: "ravi_thinks",  type: "user", forceStatus: "pending" },
  { follower: "layla_lifehacks", target: "devesh_data",  type: "user" },
  { follower: "layla_lifehacks", targetAI: "PulseAI",    type: "AI" },
  { follower: "layla_lifehacks", targetAI: "Archivist",  type: "AI" },
];
