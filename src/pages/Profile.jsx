import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, Mail, MapPin, Shield, Users, Plus, Settings, LogOut,
  Pencil, Trash2, Check, X, Star
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/auralis/GlassCard";
import ImportFromPhoneButton from "@/components/auralis/ImportFromPhoneButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AVATARS = ["👩", "👨", "👧", "🧑", "👴", "👵", "🧔", "👱", "⭐"];
const RELATIONSHIPS = ["Parent", "Spouse", "Sibling", "Friend", "Guardian", "Other"];

const defaultContacts = [
  { id: 1, name: "Mom", phone: "+91 98765 43210", email: "", relationship: "Parent", avatar: "👩", isPrimary: true },
  { id: 2, name: "Dad", phone: "+91 98765 43211", email: "", relationship: "Parent", avatar: "👨", isPrimary: false },
  { id: 3, name: "Priya", phone: "+91 98765 43212", email: "", relationship: "Friend", avatar: "👧", isPrimary: false },
  { id: 4, name: "Brother", phone: "+91 98765 43213", email: "", relationship: "Sibling", avatar: "🧑", isPrimary: false },
];

const indianEmergency = [
  { name: "Police", number: "100", icon: "🚔", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  { name: "Ambulance", number: "108", icon: "🚑", color: "bg-red-500/10 border-red-500/20 text-red-400" },
  { name: "Fire", number: "101", icon: "🚒", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  { name: "Women Helpline", number: "1091", icon: "🆘", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
];

const emptyForm = { name: "", phone: "", email: "", relationship: "Friend", avatar: "👧", isPrimary: false };

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState(defaultContacts);
  const [editingId, setEditingId] = useState(null); // null = not editing, 'new' = adding new
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCall = (number) => { window.location.href = `tel:${number}`; };

  const startEdit = (contact) => {
    setEditingId(contact.id);
    setForm({ name: contact.name, phone: contact.phone, email: contact.email || "", relationship: contact.relationship, avatar: contact.avatar, isPrimary: contact.isPrimary });
  };

  const startAdd = () => {
    setEditingId("new");
    setForm(emptyForm);
  };

  const saveContact = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    if (editingId === "new") {
      setContacts(prev => [...prev, { ...form, id: Date.now() }]);
    } else {
      setContacts(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
    }
    setEditingId(null);
  };

  const deleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  const setPrimary = (id) => {
    setContacts(prev => prev.map(c => ({ ...c, isPrimary: c.id === id })));
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 overflow-y-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Profile</h1>
        <button onClick={() => navigate("/settings")} className="w-9 h-9 glass rounded-xl flex items-center justify-center">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </motion.div>

      {/* User Card */}
      <GlassCard className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-lg font-bold">{user?.full_name || "User"}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{user?.email || "user@email.com"}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">India</span>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Days Safe", value: "127", icon: Shield },
          { label: "Check-ins", value: "342", icon: MapPin },
          { label: "Contacts", value: contacts.length.toString(), icon: Users },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard animate={false} className="text-center !p-3">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-heading font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Emergency Numbers */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          🇮🇳 Emergency Numbers
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {indianEmergency.map((e) => (
            <motion.button key={e.number} whileTap={{ scale: 0.96 }} onClick={() => handleCall(e.number)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl glass border ${e.color} text-left`}>
              <span className="text-xl">{e.icon}</span>
              <div>
                <p className="text-xs font-bold">{e.name}</p>
                <p className="text-lg font-heading font-black">{e.number}</p>
              </div>
              <Phone className="w-3.5 h-3.5 ml-auto opacity-60" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Emergency Contacts
          </h3>
          <div className="flex items-center gap-1.5">
            <ImportFromPhoneButton onImport={contacts => {
              const existingPhones = new Set(contacts.map(c => c.phone));
              setContacts(prev => {
                const newOnes = contacts.filter(c => !existingPhones.has(c.phone) && c.name && c.phone);
                return [...prev, ...newOnes];
              });
            }} />
            <button onClick={startAdd} className="w-7 h-7 glass rounded-lg flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>

        {/* Add / Edit Form */}
        <AnimatePresence>
          {editingId !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <GlassCard className="space-y-3 border border-primary/25">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {editingId === "new" ? "Add New Contact" : "Edit Contact"}
                </p>

                {/* Avatar picker */}
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">Avatar</p>
                  <div className="flex gap-2 flex-wrap">
                    {AVATARS.map(av => (
                      <button key={av} onClick={() => setForm(f => ({ ...f, avatar: av }))}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${form.avatar === av ? "bg-primary/20 border border-primary/40" : "glass"}`}>
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Name *</p>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Mom" className="h-9 text-sm bg-muted/40 border-0" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Phone *</p>
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210" className="h-9 text-sm bg-muted/40 border-0" type="tel" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Email <span className="text-primary">(for emergency alerts)</span></p>
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="contact@email.com" className="h-9 text-sm bg-muted/40 border-0" type="email" />
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">Relationship</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {RELATIONSHIPS.map(r => (
                      <button key={r} onClick={() => setForm(f => ({ ...f, relationship: r }))}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${form.relationship === r ? "bg-primary text-white" : "glass text-muted-foreground"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setForm(f => ({ ...f, isPrimary: !f.isPrimary }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${form.isPrimary ? "bg-amber-500/15 border border-amber-500/30 text-amber-400" : "glass text-muted-foreground"}`}>
                    <Star className="w-3 h-3" /> {form.isPrimary ? "Primary Contact" : "Set as Primary"}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={saveContact} disabled={!form.name.trim() || !form.phone.trim()}
                    className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={cancelEdit} className="flex-1 py-2 rounded-xl glass text-xs font-semibold flex items-center justify-center gap-1.5 text-muted-foreground">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact List */}
        <div className="space-y-2">
          <AnimatePresence>
            {contacts.map((contact, i) => (
              <motion.div key={contact.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ delay: i * 0.05 }}>
                <GlassCard animate={false} className={`!p-3 flex items-center gap-3 ${contact.isPrimary ? "border border-amber-500/25" : ""}`}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">{contact.avatar}</div>
                    {contact.isPrimary && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-amber-900" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold">{contact.name}</p>
                      {contact.isPrimary && <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">PRIMARY</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{contact.relationship} · {contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Call */}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleCall(contact.phone.replace(/\s/g, ""))}
                      className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-green-400" />
                    </motion.button>
                    {/* Star (primary toggle) */}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPrimary(contact.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${contact.isPrimary ? "bg-amber-500/15 border border-amber-500/25" : "glass"}`}>
                      <Star className={`w-3.5 h-3.5 ${contact.isPrimary ? "text-amber-400" : "text-muted-foreground"}`} />
                    </motion.button>
                    {/* Edit */}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => startEdit(contact)}
                      className="w-8 h-8 rounded-xl glass flex items-center justify-center">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </motion.button>
                    {/* Delete */}
                    {deleteConfirm === contact.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deleteContact(contact.id)} className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-destructive" />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="w-8 h-8 rounded-xl glass flex items-center justify-center">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDeleteConfirm(contact.id)}
                        className="w-8 h-8 rounded-xl glass flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {contacts.length === 0 && (
          <GlassCard className="text-center !py-8">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No emergency contacts yet</p>
            <button onClick={startAdd} className="mt-2 text-primary text-xs font-medium">+ Add your first contact</button>
          </GlassCard>
        )}
      </div>

      {/* Logout */}
      <Button variant="ghost" onClick={() => base44.auth.logout()}
        className="w-full h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}