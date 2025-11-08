export default function DesignShowcase() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12">Design System Showcase</h1>

        {/* Colors */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Colors</h2>
          <div className="grid grid-cols-5 gap-4">
            {/* Primary */}
            <div>
              <div className="h-24 bg-primary-500 rounded-lg shadow-base"></div>
              <p className="mt-2 text-sm font-medium">Primary</p>
            </div>
            {/* Secondary */}
            <div>
              <div className="h-24 bg-secondary-500 rounded-lg shadow-base"></div>
              <p className="mt-2 text-sm font-medium">Secondary</p>
            </div>
            {/* Success */}
            <div>
              <div className="h-24 bg-success-500 rounded-lg shadow-base"></div>
              <p className="mt-2 text-sm font-medium">Success</p>
            </div>
            {/* Error */}
            <div>
              <div className="h-24 bg-error-500 rounded-lg shadow-base"></div>
              <p className="mt-2 text-sm font-medium">Error</p>
            </div>
            {/* Warning */}
            <div>
              <div className="h-24 bg-warning-500 rounded-lg shadow-base"></div>
              <p className="mt-2 text-sm font-medium">Warning</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Typography</h2>
          <div className="card p-8 space-y-4">
            <h1 className="text-4xl">Heading 1 - The quick brown fox</h1>
            <h2 className="text-3xl">Heading 2 - The quick brown fox</h2>
            <h3 className="text-2xl">Heading 3 - The quick brown fox</h3>
            <h4 className="text-xl">Heading 4 - The quick brown fox</h4>
            <p className="text-base">
              Body Text - The quick brown fox jumps over the lazy dog. This is standard body text at 16px with 1.5 line height for
              optimal readability.
            </p>
            <p className="text-sm text-neutral-600">Small Text - Secondary information or captions at 14px.</p>
            <p className="text-xs text-neutral-500">Extra Small - Fine print at 12px.</p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
          <div className="card p-8">
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary</button>
              <button className="btn-secondary">Secondary</button>
              <button className="btn-ghost">Ghost</button>
              <button className="btn-danger">Danger</button>
              <button className="btn-primary" disabled>
                Disabled
              </button>
            </div>
          </div>
        </section>

        {/* Forms */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Form Elements</h2>
          <div className="card p-8 max-w-2xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Message</label>
                <textarea className="input" rows={4} placeholder="Enter your message..."></textarea>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="agree" className="rounded" />
                <label htmlFor="agree" className="text-sm text-neutral-700">
                  I agree to the terms and conditions
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Elevation (Shadows)</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium">Small</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-base">
              <p className="text-sm font-medium">Base</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm font-medium">Medium</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-sm font-medium">Large</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
