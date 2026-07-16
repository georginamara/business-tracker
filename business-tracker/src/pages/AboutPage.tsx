import {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  DEVELOPER,
  SUPPORT_EMAIL,
  COPYRIGHT_YEAR,
  RELEASE_NOTES,
} from '../data/appInfo'

export default function AboutPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About</h2>

      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md">
            B
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{APP_NAME}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Version {APP_VERSION}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
          {APP_DESCRIPTION}
        </p>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's New</h3>

        <div className="space-y-5">
          {RELEASE_NOTES.map((release) => (
            <div key={release.version}>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  v{release.version}
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">{release.date}</span>
              </div>
              <ul className="space-y-1.5 ml-1">
                {release.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 shrink-0" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Credits</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Developer</p>
            <p className="text-gray-900 dark:text-white mt-0.5">{DEVELOPER}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Support</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <p className="text-xs text-center text-gray-400 dark:text-slate-500 pb-4">
        &copy; {COPYRIGHT_YEAR} {DEVELOPER}. All rights reserved.
      </p>
    </div>
  )
}
