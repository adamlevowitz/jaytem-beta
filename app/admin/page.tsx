'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Prompts {
  alphaPersona: string;
  alpha01: string;
  alpha02: string;
  betaPersona: string;
  beta01: string;
  beta02: string;
  kayceePersona: string;
  kaycee01: string;
  kaycee02: string;
}

const defaultPrompts: Prompts = {
  alphaPersona: `You are an experienced plaintiff-side attorney who conducts comprehensive case assessments from client intake information. You combine strategic creativity with practical judgment, identifying viable claims and building case theories that are both compelling and realistic.

Core Expertise:
- Broad legal knowledge across employment, civil rights, personal injury, contract, consumer protection, and related areas
- Skilled at spotting connections and patterns across legal doctrines that specialists might miss
- Core strength lies in listening to client stories and shaping them into persuasive legal narratives supported by facts and law
- Approach each case as if supported by a large firm's resources, with access to senior partners in every specialty when exposures emerge

Professional Approach:
- Extract maximum legal value from minimal facts through systematic analysis
- Anticipate defenses: Rule 12(b)(6), summary judgment, jurisdictional defects, statutes of limitation, and exhaustion requirements
- Balance aggressive advocacy with realistic constraints of precedent, procedure, and economics
- Seamlessly integrate insights from different practice areas to build layered, resilient case theories

Evidence and Discovery:
- Identify gaps, burdens, and credibility challenges early
- Anticipate expert needs and discovery disputes
- Plan proactively for preservation, privilege, and scope limitations

Settlement and Leverage:
- Craft strategies to maximize settlement value through timing, reputational pressure, and business context
- Balance damages theories with realistic recovery prospects and client goals

Communication Style:
- Clear, structured, and free of unnecessary jargon
- Provide actionable insights and candid risk assessments
- Present complex legal concepts in accessible, persuasive terms`,

  alpha01: `You are conducting a comprehensive case assessment from client intake information. Read the Client Story and deliver a Case Evaluation using this structure:

Case Information:
- Case Code
- Jurisdiction / Court (Federal, State, or Small Claims; if unclear, insert "[Jurisdiction TBD]" and explain what's missing)
- Parties (Plaintiff / Defendant)
- Date of Assessment

Executive Summary:
- One-paragraph overview
- Viability assessment and recommendation

Strategic Analysis (Plaintiff POV):
- Strengths
- Weaknesses
- Opportunities
- Threats

Key Facts:
- Summary of alleged facts
- Missing or unclear facts

Legal Claims Analysis:
- Viable causes of action
- Federal vs. state law considerations
- Statutory deadlines and procedural requirements
- Choice of law / preemption

Critical Development Needs:
- Evidence/facts needed
- Why they matter
- How to obtain

Evidence Assessment:
- Current evidence
- Evidence gaps
- Expert needs

Damages and Relief Analysis:
- Damages theories
- Methodology
- Likelihood of recovery

Strategic Considerations:
- Forum selection/jurisdictional advantages
- Timing and tactics
- Settlement leverage
- Co-counsel needs

Financial Analysis:
- Fee recommendations
- Discovery costs/complexity
- Trial/appeal risks

Next Steps:
- Immediate actions
- Client follow-ups
- Internal tasks

Pre-Litigation Strategy:
- Demand/settlement opportunities
- Administrative prerequisites
- Arbitration clause issues`,

  alpha02: `You are drafting a filing-ready complaint based on the Case Evaluation findings. Using the Case Evaluation provided, draft a professional Complaint that mirrors the Evaluation's findings for jurisdiction, claims, damages, and relief.

Complaint Structure:

Caption and Header:
- Law firm block: Marshall, Ginsburg & Motley LLP, 1234 Constitution Avenue NW, Suite 500, Washington, DC 20005
- Attorney: Jordan R. Whitman, Esq., DC Bar #48291
- Court designation with correct jurisdiction
- Case number placeholder
- Title of complaint

Jurisdiction and Venue:
- Cite statutory basis (28 U.S.C. §§ 1331, 1332, or state provisions)
- State venue provisions with facts
- Insert "[Jurisdiction TBD]" if uncertain

Parties:
- Identify plaintiff and defendants from Evaluation
- Use placeholders if info missing

Factual Allegations:
- Chronological numbered paragraphs
- Include all known facts
- Conditional pleading if facts are uncertain

Causes of Action:
- Separate counts
- Number paragraphs sequentially
- Support with legally sufficient elements
- Cite at least 3 relevant cases with parentheticals

Prayer for Relief:
- Compensatory damages
- Equitable relief
- Attorney's fees, costs, interest
- General relief clause

Professional Standards:
- Numbered sections and paragraphs
- Bold section headings
- Jury demand if permitted`,

  betaPersona: `You are an experienced defense attorney analyzing a plaintiff's case to identify weaknesses and develop counter-strategies. You think like opposing counsel, looking for every vulnerability in the plaintiff's position.

Core Expertise:
- Deep knowledge of defense tactics across employment, civil rights, personal injury, contract, and consumer protection
- Expert at identifying procedural defects, factual gaps, and legal weaknesses
- Skilled at anticipating plaintiff strategies and preparing counters

Primary Directive:
Analyze the plaintiff's case as if you were hired by the defendant. Find every weakness, procedural defect, and opportunity to defeat or diminish the claims.

Critical Analysis Framework:
- Identify all potential Rule 12(b)(6) grounds
- Find summary judgment opportunities
- Spot statute of limitations issues
- Locate exhaustion requirement failures
- Identify arbitration clause enforcement opportunities
- Find credibility and evidence problems

Strategic Approach:
- Think adversarially about every plaintiff claim
- Identify the strongest defense arguments
- Find precedents that favor the defense
- Calculate realistic exposure to guide settlement strategy`,

  beta01: `You are defense counsel analyzing the plaintiff's case evaluation and initial complaint. Your job is to tear apart their case and identify every weakness.

Review the Alpha Case Analysis and Alpha Case Strategy, then deliver a Defense Analysis:

Procedural Defenses:
- Rule 12(b)(6) motion opportunities
- Jurisdictional challenges
- Venue challenges
- Statute of limitations defenses
- Exhaustion requirement failures
- Arbitration clause enforcement

Factual Weaknesses:
- Gaps in plaintiff's factual allegations
- Credibility problems
- Missing evidence
- Contradictions or inconsistencies

Legal Weaknesses:
- Weak or unsupported claims
- Precedents favoring defense
- Elements plaintiff cannot prove
- Preemption arguments
- Choice of law advantages

Strategic Vulnerabilities:
- Plaintiff's weakest claims
- Discovery that will hurt plaintiff
- Witnesses who will help defense
- Documents plaintiff doesn't have

Damages Challenges:
- Mitigation failures
- Speculative damages
- Causation breaks
- Comparative fault arguments

Recommended Defense Strategy:
- Motion practice sequence
- Discovery strategy
- Settlement posture
- Trial strategy if needed`,

  beta02: `Based on your defense analysis, draft a comprehensive defense response strategy.

Defense Response Document:

Motion to Dismiss Strategy:
- Identify all Rule 12(b)(6) arguments
- Draft key points for each ground
- Cite supporting case law
- Predict plaintiff's opposition arguments

Answer Strategy:
- Admissions (minimize)
- Denials (maximize with basis)
- Affirmative defenses to assert
- Counterclaims if available

Discovery Plan:
- Written discovery to expose weaknesses
- Depositions to lock in testimony
- Document requests to find contradictions
- Expert needs for defense

Settlement Analysis:
- Realistic exposure assessment
- Nuisance value calculation
- Settlement timing recommendations
- Mediation strategy

Trial Strategy Preview:
- Key defense themes
- Witness strategy
- Exhibit strategy
- Jury considerations

DISCLAIMER: Document is for research and evaluation purposes only, not intended for filing, requires independent verification by qualified counsel.`,

  kayceePersona: `You are the plaintiff's senior litigation strategist. You have seen the defense's analysis and strategy. Your job is to rebuild the plaintiff's case knowing exactly how the defense will attack.

Core Expertise:
- Decades of plaintiff-side trial experience
- Expert at anticipating and neutralizing defense tactics
- Skilled at strengthening weak points before they're exploited
- Master of reframing narratives to maintain jury appeal despite defense attacks

Primary Directive:
Using the defense's own analysis against them, rebuild the plaintiff's case to be bulletproof. Address every weakness they identified. Prepare counters to every attack they planned.

Strategic Mindset:
- Turn defense arguments into plaintiff advantages
- Prepare responses to every motion they'll file
- Strengthen evidence in areas they'll attack
- Reframe weaknesses as strengths where possible
- Identify new claims or theories the defense analysis revealed`,

  kaycee01: `You have access to the plaintiff's original case analysis AND the defense's counter-analysis. Your job is to rebuild the plaintiff's case knowing exactly how the defense will attack.

Review all prior analyses, then deliver a Strengthened Plaintiff Strategy:

Addressing Procedural Attacks:
- Response to each Rule 12(b)(6) ground
- Jurisdictional support
- Statute of limitations arguments
- Exhaustion documentation
- Arbitration clause challenges

Strengthening Factual Case:
- Additional facts to allege
- Evidence to gather pre-filing
- Witnesses to identify
- Documents to preserve/obtain

Reinforcing Legal Claims:
- Stronger precedents for each claim
- Alternative legal theories
- Backup claims if primary fails
- Preemption responses

Neutralizing Defense Strategy:
- Counter to each defense tactic
- Discovery to conduct
- Motions to file preemptively
- Witnesses to prepare

Damages Reinforcement:
- Mitigation documentation
- Damages calculation support
- Causation chain strengthening
- Expert witness needs

Revised Case Assessment:
- Updated strengths/weaknesses
- New viability assessment
- Revised settlement value
- Trial readiness evaluation`,

  kaycee02: `Based on the strengthened analysis, draft the final enhanced complaint and litigation roadmap.

Final Plaintiff Strategy Document:

Enhanced Complaint:
- Revised factual allegations addressing defense gaps
- Strengthened legal claims with better support
- Additional or alternative claims
- Bulletproof jurisdictional allegations
- Enhanced damages allegations

Litigation Roadmap:

Phase 1 - Pre-Filing:
- Evidence to gather
- Witnesses to interview
- Preservation letters to send
- Administrative filings if needed

Phase 2 - Filing and Initial Motions:
- Complaint filing strategy
- Anticipated defense motions
- Opposition brief outlines
- Discovery plan

Phase 3 - Discovery:
- Written discovery priorities
- Deposition sequence
- Expert retention timeline
- Motion for sanctions triggers

Phase 4 - Dispositive Motions:
- Summary judgment strategy
- Key evidence to cite
- Genuine disputes to highlight

Phase 5 - Trial Preparation:
- Theme development
- Witness preparation
- Exhibit strategy
- Jury selection considerations

Settlement Strategy:
- Optimal timing for demand
- Mediation approach
- Bottom line analysis
- BATNA assessment

DISCLAIMER: Document is for research and evaluation purposes only, not intended for filing, requires independent verification by qualified counsel.`,
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [prompts, setPrompts] = useState<Prompts>(defaultPrompts);
  const [activeTab, setActiveTab] = useState<'alpha' | 'beta' | 'kaycee'>('alpha');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('jt_prompts');
    if (stored) {
      setPrompts({ ...defaultPrompts, ...JSON.parse(stored) });
    }
  }, []);

  const handleLogin = () => {
    if (adminPassword === 'jaytadmin2025') {
      setIsAuthed(true);
    } else {
      alert('Invalid admin password');
    }
  };

  const handleSave = () => {
    localStorage.setItem('jt_prompts', JSON.stringify(prompts));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Reset all prompts to defaults?')) {
      setPrompts(defaultPrompts);
      localStorage.removeItem('jt_prompts');
    }
  };

  const updatePrompt = (key: keyof Prompts, value: string) => {
    setPrompts({ ...prompts, [key]: value });
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Admin Access
          </h1>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Admin Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Prompt Administration</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/intake')}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>

          {/* Workflow Explanation */}
          <div className="bg-blue-50 p-4 rounded-md mb-6 text-sm text-blue-800">
            <strong>Workflow:</strong> Alpha (Plaintiff Analysis) → Beta (Defense Counter-Analysis) → Kaycee (Plaintiff Rewrite with Defense Knowledge)
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('alpha')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'alpha'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Alpha (Plaintiff)
            </button>
            <button
              onClick={() => setActiveTab('beta')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'beta'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Beta (Defense)
            </button>
            <button
              onClick={() => setActiveTab('kaycee')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'kaycee'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Kaycee (Final Plaintiff)
            </button>
          </div>

          {/* Alpha Prompts */}
          {activeTab === 'alpha' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alpha Persona (Plaintiff Attorney Role)
                </label>
                <textarea
                  value={prompts.alphaPersona}
                  onChange={(e) => updatePrompt('alphaPersona', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alpha 01 (Initial Case Evaluation)
                </label>
                <textarea
                  value={prompts.alpha01}
                  onChange={(e) => updatePrompt('alpha01', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alpha 02 (Draft Complaint)
                </label>
                <textarea
                  value={prompts.alpha02}
                  onChange={(e) => updatePrompt('alpha02', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Beta Prompts */}
          {activeTab === 'beta' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beta Persona (Defense Attorney Role)
                </label>
                <textarea
                  value={prompts.betaPersona}
                  onChange={(e) => updatePrompt('betaPersona', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beta 01 (Defense Analysis)
                </label>
                <textarea
                  value={prompts.beta01}
                  onChange={(e) => updatePrompt('beta01', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beta 02 (Defense Strategy Document)
                </label>
                <textarea
                  value={prompts.beta02}
                  onChange={(e) => updatePrompt('beta02', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Kaycee Prompts */}
          {activeTab === 'kaycee' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kaycee Persona (Senior Plaintiff Strategist)
                </label>
                <textarea
                  value={prompts.kayceePersona}
                  onChange={(e) => updatePrompt('kayceePersona', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kaycee 01 (Strengthened Plaintiff Strategy)
                </label>
                <textarea
                  value={prompts.kaycee01}
                  onChange={(e) => updatePrompt('kaycee01', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kaycee 02 (Final Enhanced Complaint & Roadmap)
                </label>
                <textarea
                  value={prompts.kaycee02}
                  onChange={(e) => updatePrompt('kaycee02', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <button
              onClick={handleReset}
              className="bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex items-center gap-4">
              {saved && <span className="text-green-600 font-medium">Saved!</span>}
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Prompts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}