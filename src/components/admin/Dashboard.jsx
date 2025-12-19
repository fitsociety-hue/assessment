import React, { useState } from 'react';
import { Upload, Users, BarChart3, AlertCircle } from 'lucide-react';
import { DataEngine } from '../../utils/dataEngine';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        progress: 0
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const data = await DataEngine.parseCSV(file);
                // Mock processing
                setStats({
                    total: data.length,
                    completed: Math.floor(data.length * 0.3), // Mock
                    progress: 30
                });
                alert(`Successfully loaded ${data.length} records.`);
            } catch (err) {
                alert('Error parsing CSV');
            }
        }
    };

    return (
        <div className="dashboard-grid">
            <div className="card" style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                <h2>Good Morning, Administrator</h2>
                <p className="text-sub">Here is the overview of the 2025 Performance Appraisal.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <StatCard
                        icon={<Users className="text-blue-500" />}
                        label="Total Employees"
                        value={stats.total || '-'}
                        sub="Target Targets"
                    />
                    <StatCard
                        icon={<FileText className="text-teal-500" />}
                        label="Evaluations"
                        value={stats.completed || '-'}
                        sub="Submitted"
                    />
                    <StatCard
                        icon={<BarChart3 className="text-indigo-500" />}
                        label="Progress"
                        value={`${stats.progress}%`}
                        sub="Overall Rate"
                    />
                    <div className="card" style={{ border: '2px dashed var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '1rem' }}>
                        <input type="file" id="csvInput" style={{ display: 'none' }} onChange={handleFileUpload} accept=".csv" />
                        <label htmlFor="csvInput" style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <Upload className="text-sub" size={32} />
                            <div style={{ marginTop: '0.5rem', fontWeight: 500 }}>Upload Employee List</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>CSV Format</div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="card" style={{ minHeight: '400px' }}>
                <h3>Department Status</h3>
                <p className="text-sub">Real-time submission monitoring</p>
                {/* Placeholder for Charts */}
                <div style={{ background: 'var(--bg-input)', height: '200px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Chart Visualization Area
                </div>
            </div>

            <div className="card" style={{ minHeight: '400px' }}>
                <h3>Action Required</h3>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1rem' }}>
                    <AlertItem type="weak" msg="3 Employees need Supervision" />
                    <AlertItem type="info" msg="Marketing Team: Low Completion Rate" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub }) {
    return (
        <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                {label}
                {icon}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{sub}</div>
        </div>
    );
}

function AlertItem({ type, msg }) {
    const color = type === 'weak' ? '#ef4444' : '#3b82f6';
    return (
        <div style={{ padding: '1rem', borderLeft: `4px solid ${color}`, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle size={20} color={color} />
            <span>{msg}</span>
        </div>
    );
}
