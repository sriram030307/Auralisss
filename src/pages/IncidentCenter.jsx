import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield, Clock, MapPin, ChevronDown, ChevronUp, ArrowLeft,
  Camera, Mic, StopCircle, FolderOpen, Image, FileAudio,
  Trash2, Plus, FileText, Check, X, Link2,
  CheckCircle2, Send, Eye, Loader2
} from "lucide-react";
import GlassCard from "@/components/auralis/GlassCard";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useSafetyEngineContext } from "@/contexts/SafetyEngineContext";

const mockIncidents = [
  {
    id: 1, type: "sos", date: "2026-05-28", time: "22:14", location: "Connaught Place, Delhi",
    summary: "SOS triggered manually. Location shared with 3 contacts. Police notified. Resolved in 8 minutes.",
    score: 22, severity: "Emergency", resolved: true,
    timeline: ["22:14 – SOS activated", "22:14 – GPS lock acquired", "22:15 – 3 contacts notified", "22:18 – Guardian Mom confirmed contact", "22:22 – Incident resolved by user"],
    contactsStatus: [
      { name: "Mom", phone: "+91 98765 43210", status: "opened", time: "22:17" },
      { name: "Dad", phone: "+91 98765 43211", status: "delivered", time: "22:15" },
      { name: "Priya", phone: "+91 98765 43212", status: "delivered", time: "22:16" },
    ],
  },
  {
    id: 2, type: "ai_alert", date: "2026-05-25", time: "23:50", location: "Sector 18, Noida",
    summary: "AI detected unusual route deviation and prolonged inactivity during late night travel. Safety verification completed.",
    score: 45, severity: "Elevated Risk", resolved: true,
    timeline: ["23:50 – Route deviation detected", "23:51 – Safety verification sent", "23:52 – User confirmed safe", "23:52 – Incident closed"],
    contactsStatus: [],
  },
];

const severityStyle = {
  Emergency: "text-red-400 bg-red-500/10 border-red-500/20",
  "Elevated Risk": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Caution: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const TABS = ["incidents", "vault", "log"];

export default function IncidentCenter() {
  const navigate = useNavigate();
  const { location, locationHistory } = useSafetyEngineContext();
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("incidents");

  // Evidence vault
  const [evidenceItems, setEvidenceItems] = useState(() => {
    // Load auto-recordings from emergency workflow
    const auto = JSON.parse(sessionStorage.getItem("auralis_auto_recordings") || "[]");
    return [
      { id: 1, type: "photo", name: "photo_sos_20260528.jpg", size: "1.2 MB", date: "2026-05-28 22:14", preview: null, auto: false },
      { id: 2, type: "audio", name: "voicememo_20260525.m4a", size: "320 KB", date: "2026-05-25 23:50", preview: null, auto: false },
      ...auto,
    ];
  });
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Safety log
  const [logs, setLogs] = useState([
    {
      id: 1, type: "note", content: "Felt unsafe near Sadar Bazar at night. Took alternate route.", date: "2026-05-28 22:10",
      location: "Sadar Bazar, Delhi", photoUrl: null, linkedRoute: true,
    },
    {
      id: 2, type: "note", content: "Suspicious vehicle following for 3 blocks on MG Road.", date: "2026-05-25 23:45",
      location: "MG Road, Gurugram", photoUrl: null, linkedRoute: true,
    },
  ]);
  const [addingLog, setAddingLog] = useState(false);
  const [logForm, setLogForm] = useState({ content: "", type: "note" });
  const [logPhoto, setLogPhoto] = useState(null);
  const logPhotoRef = useRef(null);

  const { data: alerts = [] } = useQuery({
    queryKey: ["safety-alerts"],
    queryFn: () => base44.entities.SafetyAlert.list("-created_date", 20),
  });

  const allIncidents = [
    ...alerts.filter(a => a.type === "sos" || a.type === "ai_alert").slice(0, 5).map((a, i) => ({
      id: `db-${i}`,
      type: a.type,
      date: new Date(a.created_date).toLocaleDateString(),
      time: new Date(a.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location: a.address || "Location not recorded",
      summary: a.message || "Automated safety alert.",
      score: 40, severity: "Elevated Risk", resolved: a.status !== "active",
      timeline: [`${new Date(a.created_date).toLocaleTimeString()} – Alert created`],
      contactsStatus: (a.contacts_notified || []).map((name) => ({
        name, phone: "", status: "sent", time: new Date(a.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })),
    })),
    ...mockIncidents,
  ].slice(0, 8);

  // --- Evidence Vault ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    let url = null;
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      url = res.file_url;
    } catch (_) { url = URL.createObjectURL(file); }
    setEvidenceItems(prev => [{
      id: Date.now(), type: "photo", name: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      date: new Date().toLocaleString(), preview: url, auto: false,
    }, ...prev]);
    setUploading(false);
    e.target.value = "";
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setEvidenceItems(prev => [{
        id: Date.now(), type: "audio",
        name: `voicememo_${Date.now()}.webm`,
        size: `${(blob.size / 1024).toFixed(0)} KB`,
        date: new Date().toLocaleString(),
        preview: URL.createObjectURL(blob), auto: false,
      }, ...prev]);
      stream.getTracks().forEach(t => t.stop());
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const deleteEvidence = (id) => setEvidenceItems(prev => prev.filter(e => e.id !== id));
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // --- Safety Log ---
  const handleLogPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let url = null;
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      url = res.file_url;
    } catch (_) { url = URL.createObjectURL(file); }
    setLogPhoto(url);
    e.target.value = "";
  };

  const saveLog = () => {
    if (!logForm.content.trim()) return;
    const now = new Date();
    const currentLoc = location
      ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E`
      : "Location unavailable";
    const hasRecentRoute = locationHistory && locationHistory.length > 2;

    setLogs(prev => [{
      id: Date.now(),
      type: logForm.type,
      content: logForm.content,
      date: now.toLocaleString(),
      location: currentLoc,
      photoUrl: logPhoto,
      linkedRoute: hasRecentRoute,
    }, ...prev]);
    setLogForm({ content: "", type: "note" });
    setLogPhoto(null);
    setAddingLog(false);
  };

  const deleteLog = (id) => setLogs(prev => prev.filter(l => l.id !== id));

  const tabLabels = { incidents: "📋 History", vault: "🗄️ Vault", log: "📝 Safety Log" };

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Incident Center</h1>
          <p className="text-xs text-muted-foreground">Evidence, logs & history</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Incidents", value: allIncidents.length, color: "text-foreground" },
          { label: "Evidence", value: evidenceItems.length, color: "text-primary" },
          { label: "Log Entries", value: logs.length, color: "text-green-400" },
        ].map((s) => (
          <GlassCard key={s.label} animate={false} className="!p-3 text-center">
            <p className={`text-xl font-heading font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1.5">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all ${activeTab === t ? "bg-primary text-white" : "glass text-muted-foreground"}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* ===== INCIDENTS TAB ===== */}
      {activeTab === "incidents" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {allIncidents.length === 0 && (
            <GlassCard className="text-center !py-10">
              <Shield className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-400">No incidents recorded</p>
            </GlassCard>
          )}
          {allIncidents.map((incident, i) => (
            <motion.div key={incident.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard animate={false} className="!p-0 overflow-hidden">
                <button onClick={() => setExpanded(expanded === incident.id ? null : incident.id)} className="w-full text-left p-4">
                  <div className="flex items-start gap-3">
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 mt-0.5 ${severityStyle[incident.severity] || severityStyle["Caution"]}`}>
                      {incident.severity}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{incident.type === "sos" ? "🆘 SOS Event" : "🤖 AI Alert"}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />{incident.date} {incident.time}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{incident.location}
                        </span>
                      </div>
                    </div>
                    {expanded === incident.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {expanded === incident.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-4 pb-4 border-t border-border/40 pt-3 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">AI Summary</p>
                      <p className="text-xs leading-relaxed">{incident.summary}</p>
                    </div>

                    {/* Contact Delivery Status */}
                    {incident.contactsStatus && incident.contactsStatus.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                          Emergency Contacts
                        </p>
                        <div className="space-y-1.5">
                          {incident.contactsStatus.map((c, ci) => {
                            const statusCfg = {
                              sent: { icon: Send, color: "text-slate-400", bg: "bg-slate-500/10", label: "Sent" },
                              delivered: { icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10", label: "Delivered" },
                              opened: { icon: Eye, color: "text-green-400", bg: "bg-green-500/10", label: "Opened" },
                            }[c.status] || { icon: Loader2, color: "text-muted-foreground", bg: "bg-muted/50", label: "Pending" };
                            const Icon = statusCfg.icon;
                            return (
                              <div key={ci} className="flex items-center gap-2.5 py-1.5">
                                <div className={`w-6 h-6 rounded-full ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
                                  <Icon className={`w-3 h-3 ${statusCfg.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{c.name}</p>
                                  {c.phone && <p className="text-[10px] text-muted-foreground">{c.phone}</p>}
                                </div>
                                <span className={`text-[10px] font-semibold ${statusCfg.color}`}>
                                  {statusCfg.label} {c.time && `· ${c.time}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Timeline</p>
                      <div className="space-y-1.5">
                        {incident.timeline.map((event, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${incident.resolved ? "text-green-400" : "text-destructive"}`}>
                      <div className={`w-2 h-2 rounded-full ${incident.resolved ? "bg-green-400" : "bg-destructive animate-pulse"}`} />
                      {incident.resolved ? "Resolved" : "Active"}
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ===== EVIDENCE VAULT TAB ===== */}
      {activeTab === "vault" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="!p-3 flex items-center gap-3 border border-primary/20">
            <Shield className="w-7 h-7 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Evidence Vault</p>
              <p className="text-xs text-muted-foreground">Photos & voice memos. Auto-recordings from Emergency events appear here automatically.</p>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="glass border border-primary/20 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Camera className={`w-5 h-5 text-primary ${uploading ? "animate-pulse" : ""}`} />
              </div>
              <p className="text-xs font-semibold">{uploading ? "Uploading..." : "Capture Photo"}</p>
              <p className="text-[10px] text-muted-foreground">Camera or file picker</p>
            </motion.button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />

            <motion.button whileTap={{ scale: 0.96 }} onClick={recording ? stopRecording : startRecording}
              className={`glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center border transition-all ${recording ? "border-destructive/40 bg-destructive/5" : "border-accent/20"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${recording ? "bg-destructive/15" : "bg-accent/10"}`}>
                {recording ? <StopCircle className="w-5 h-5 text-destructive animate-pulse" /> : <Mic className="w-5 h-5 text-accent" />}
              </div>
              <p className="text-xs font-semibold">{recording ? `Stop · ${fmt(recordingTime)}` : "Voice Memo"}</p>
              <p className="text-[10px] text-muted-foreground">{recording ? "Recording..." : "Tap to record"}</p>
            </motion.button>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stored Files ({evidenceItems.length})</p>
            {evidenceItems.length === 0 && (
              <GlassCard className="text-center !py-8">
                <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No evidence files yet</p>
              </GlassCard>
            )}
            <AnimatePresence>
              {evidenceItems.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}>
                  <GlassCard animate={false} className={`!p-3 flex items-center gap-3 ${item.auto ? "border border-destructive/25" : ""}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === "photo" ? "bg-blue-500/10" : "bg-accent/10"}`}>
                      {item.type === "photo"
                        ? (item.preview ? <img src={item.preview} alt="thumb" className="w-10 h-10 rounded-xl object-cover" /> : <Image className="w-5 h-5 text-blue-400" />)
                        : <FileAudio className="w-5 h-5 text-accent" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold truncate">{item.name}</p>
                        {item.auto && <span className="text-[9px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">AUTO</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.size} · {item.date}</p>
                      {item.type === "audio" && item.preview && (
                        <audio src={item.preview} controls className="mt-1 w-full h-7" />
                      )}
                    </div>
                    <button onClick={() => deleteEvidence(item.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ===== SAFETY LOG TAB ===== */}
      {activeTab === "log" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Add entry button */}
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => setAddingLog(true)}
            className="w-full glass border border-primary/25 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Add Safety Log Entry</p>
              <p className="text-xs text-muted-foreground">Note, photo, timestamped & location-tagged</p>
            </div>
          </motion.button>

          {/* New log form */}
          <AnimatePresence>
            {addingLog && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <GlassCard className="space-y-3 border border-primary/25">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">New Log Entry</p>

                  {/* Type selector */}
                  <div className="flex gap-2">
                    {[
                      { key: "note", label: "📝 Note" },
                      { key: "observation", label: "👁️ Observation" },
                      { key: "incident", label: "⚠️ Incident" },
                    ].map(t => (
                      <button key={t.key} onClick={() => setLogForm(f => ({ ...f, type: t.key }))}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${logForm.type === t.key ? "bg-primary text-white" : "glass text-muted-foreground"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={logForm.content}
                    onChange={e => setLogForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Describe what happened or what you observed..."
                    rows={3}
                    className="w-full bg-muted/40 rounded-xl p-3 text-sm resize-none border-0 outline-none placeholder:text-muted-foreground/50"
                  />

                  {/* Photo attach */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => logPhotoRef.current?.click()}
                      className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground border border-border/30">
                      <Camera className="w-3.5 h-3.5" /> {logPhoto ? "Photo attached ✓" : "Attach Photo"}
                    </button>
                    {logPhoto && <img src={logPhoto} alt="preview" className="w-8 h-8 rounded-lg object-cover" />}
                  </div>
                  <input ref={logPhotoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLogPhotoUpload} />

                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Auto-tagged: {location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : "Location unavailable"} · {new Date().toLocaleString()}
                    {locationHistory?.length > 2 && <span className="ml-1 text-primary">· Route linked ✓</span>}
                  </p>

                  <div className="flex gap-2">
                    <button onClick={saveLog} disabled={!logForm.content.trim()}
                      className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
                      <Check className="w-3.5 h-3.5" /> Save Log
                    </button>
                    <button onClick={() => { setAddingLog(false); setLogPhoto(null); }}
                      className="flex-1 py-2 rounded-xl glass text-xs font-semibold flex items-center justify-center gap-1.5 text-muted-foreground">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Log entries */}
          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Log Entries ({logs.length})</p>
            {logs.length === 0 && (
              <GlassCard className="text-center !py-8">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No log entries yet</p>
              </GlassCard>
            )}
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}>
                  <GlassCard animate={false} className="!p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{log.type === "note" ? "📝" : log.type === "observation" ? "👁️" : "⚠️"}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{log.type}</span>
                        {log.linkedRoute && (
                          <span className="flex items-center gap-0.5 text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-bold">
                            <Link2 className="w-2.5 h-2.5" /> Route linked
                          </span>
                        )}
                      </div>
                      <button onClick={() => deleteLog(log.id)} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed">{log.content}</p>

                    {log.photoUrl && (
                      <img src={log.photoUrl} alt="log" className="w-full h-32 object-cover rounded-xl" />
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{log.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{log.location}</span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}