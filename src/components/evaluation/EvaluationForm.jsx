import React from 'react';
import { useParams } from 'react-router-dom';

export default function EvaluationForm() {
    const { id } = useParams();

    return (
        <div className="container">
            <div className="card">
                <h1>Evaluation Form</h1>
                <p>Currently viewing evaluation for ID: <b>{id || 'Demo Mode'}</b></p>

                <form style={{ marginTop: '2rem' }}>
                    <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem' }}>Self Report</h3>

                    <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                1. Major Achievements of 2025
                            </label>
                            <textarea className="input-field" rows="4" placeholder="Describe your key achievements..."></textarea>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                2. Goals for Next Year
                            </label>
                            <textarea className="input-field" rows="4" placeholder="Outline your goals..."></textarea>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button type="button" className="btn btn-primary" onClick={() => alert('Saved!')}>
                                Submit Self Report
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
