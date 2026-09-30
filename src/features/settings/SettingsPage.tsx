import { useRef, useState } from 'react'
import { Card } from '../../components/Card'
import { Field, NumberInput, TextInput } from '../../components/FormControls'
import { useSettings, updateSettings } from '../../lib/useSettings'
import { exportAllData, downloadBackup, importAllData, isValidBackup, clearAllData } from '../../lib/backup'
import type { ScoringWeights, Targets } from '../../db/types'
import { Download, Upload, Trash2 } from 'lucide-react'
import { ProteinCalculator } from '../../components/ProteinCalculator'

export function SettingsPage() {
  const settings = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  if (!settings) return <div className="p-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</div>

  function setTargets(patch: Partial<Targets>) {
    void updateSettings({ targets: { ...settings!.targets, ...patch } })
  }

  function setWeights(patch: Partial<ScoringWeights>) {
    void updateSettings({ weights: { ...settings!.weights, ...patch } })
  }

  const weightTotal = Object.values(settings.weights).reduce((a, b) => a + b, 0)

  async function handleExport() {
    const payload = await exportAllData()
    downloadBackup(payload)
    setStatus('Backup downloaded.')
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!isValidBackup(data)) {
        setStatus('That file does not look like a Winter Arc backup.')
        return
      }
      await importAllData(data)
      setStatus('Data restored from backup. Reloading…')
      setTimeout(() => window.location.reload(), 800)
    } catch {
      setStatus('Failed to read that file.')
    }
  }

  async function handleClear() {
    if (!confirm('This will permanently delete all Winter Arc data on this device. Continue?')) return
    await clearAllData()
    setStatus('All data cleared. Reloading…')
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold">Settings</h1>

      <Card title="Winter Arc">
        <Field label="Start date" hint="Day 1 of your 90-day arc">
          <TextInput
            type="date"
            value={settings.winterArcStartDate}
            onChange={(e) => e.target.value && void updateSettings({ winterArcStartDate: e.target.value })}
          />
        </Field>
      </Card>

      <Card title="Targets">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="DSA normal (min)">
            <NumberInput value={settings.targets.dsaNormalMin} onChange={(e) => setTargets({ dsaNormalMin: Number(e.target.value) })} />
          </Field>
          <Field label="DSA minimum (min)">
            <NumberInput value={settings.targets.dsaMinimumMin} onChange={(e) => setTargets({ dsaMinimumMin: Number(e.target.value) })} />
          </Field>
          <Field label="LLD normal (min)">
            <NumberInput value={settings.targets.lldNormalMin} onChange={(e) => setTargets({ lldNormalMin: Number(e.target.value) })} />
          </Field>
          <Field label="LLD minimum (min)">
            <NumberInput value={settings.targets.lldMinimumMin} onChange={(e) => setTargets({ lldMinimumMin: Number(e.target.value) })} />
          </Field>
          <Field label="Protein target (g)" hint="Or use the calculator below">
            <NumberInput value={settings.targets.proteinG} onChange={(e) => setTargets({ proteinG: Number(e.target.value) })} />
          </Field>
          <Field label="Steps target">
            <NumberInput value={settings.targets.stepsCount} onChange={(e) => setTargets({ stepsCount: Number(e.target.value) })} />
          </Field>
          <Field label="Sleep minimum (h)">
            <NumberInput value={settings.targets.sleepMinHours} onChange={(e) => setTargets({ sleepMinHours: Number(e.target.value) })} />
          </Field>
          <Field label="Sleep target (h)">
            <NumberInput value={settings.targets.sleepTargetHours} onChange={(e) => setTargets({ sleepTargetHours: Number(e.target.value) })} />
          </Field>
          <Field label="Target bedtime">
            <TextInput type="time" value={settings.targets.sleepTargetBedtime} onChange={(e) => setTargets({ sleepTargetBedtime: e.target.value })} />
          </Field>
          <Field label="Target wake time">
            <TextInput type="time" value={settings.targets.sleepTargetWake} onChange={(e) => setTargets({ sleepTargetWake: e.target.value })} />
          </Field>
          <Field label="Reading target (min)">
            <NumberInput value={settings.targets.readingTargetMin} onChange={(e) => setTargets({ readingTargetMin: Number(e.target.value) })} />
          </Field>
          <Field label="Communication target (min)">
            <NumberInput value={settings.targets.commTargetMin} onChange={(e) => setTargets({ commTargetMin: Number(e.target.value) })} />
          </Field>
        </div>
      </Card>

      <Card title="Protein calculator">
        <ProteinCalculator onApply={(grams) => { setTargets({ proteinG: grams }); setStatus(`Daily protein target set to ${grams}g.`) }} />
      </Card>

      <Card title="Scoring weights" action={<span className="text-xs" style={{ color: weightTotal === 100 ? 'var(--color-good)' : 'var(--color-ok)' }}>Total: {weightTotal}%</span>}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(settings.weights) as (keyof ScoringWeights)[]).map((key) => (
            <Field key={key} label={key}>
              <NumberInput value={settings.weights[key]} onChange={(e) => setWeights({ [key]: Number(e.target.value) } as Partial<ScoringWeights>)} />
            </Field>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
          Weights don't need to sum to exactly 100 — the score is normalized against whichever categories apply on a given day.
        </p>
      </Card>

      <Card title="Backup & restore">
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--color-accent)', color: '#0b0d10' }}>
            <Download size={15} /> Export backup (JSON)
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--color-border)' }}>
            <Upload size={15} /> Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
          />
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--color-bad)', color: 'var(--color-bad)' }}>
            <Trash2 size={15} /> Clear all data
          </button>
        </div>
        {status && <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>{status}</p>}
        <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
          All data lives only in this browser's IndexedDB storage. Nothing is sent anywhere. Export regularly to back up.
        </p>
      </Card>
    </div>
  )
}
