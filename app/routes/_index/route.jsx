import { Form } from "react-router";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  return null;
};

export default function App() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowRight} />
      
      <div className={styles.container}>
        {/* Navbar */}
        <nav className={styles.navbar}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span>Countdown Timer</span>
          </div>
          <Form method="get" action="/app">
             <button className={styles.signInBtn} type="submit">Sign In</button>
          </Form>
        </nav>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Shopify Countdown Timer App</span>
            <h1 className={styles.heading}>
              Create Urgency And<br/>
              Boost Sales With<br/>
              <span className={styles.gradientText}>Countdown Timers</span>
            </h1>
            <p className={styles.description}>
              Add beautiful countdown timers to your Shopify store and increase conversions without coding.
            </p>
            
            <Form className={styles.ctaForm} method="get" action="/app">
              <input 
                className={styles.ctaInput} 
                type="text" 
                name="shop" 
                placeholder="your-store.myshopify.com"
                required
              />
              <button className={styles.ctaButton} type="submit">
                Open Dashboard <span>&rarr;</span>
              </button>
            </Form>
          </div>

          <div className={styles.mockupWrapper}>
            <div className={styles.mockupCard}>
              <div className={styles.mockupSidebar}>
                <div className={`${styles.mockupSidebarItem} ${styles.active}`}></div>
                <div className={styles.mockupSidebarItem}></div>
                <div className={styles.mockupSidebarItem}></div>
                <div className={styles.mockupSidebarItem}></div>
              </div>
              <div className={styles.mockupMain}>
                <div className={styles.mockupHeader}></div>
                <div className={styles.mockupGrid}>
                  <div className={styles.mockupStatCard}>
                    <div className={styles.mockupStatLine1}></div>
                    <div className={styles.mockupStatLine2}></div>
                  </div>
                  <div className={styles.mockupStatCard}>
                    <div className={styles.mockupStatLine1}></div>
                    <div className={styles.mockupStatLine2}></div>
                  </div>
                </div>
                <div className={styles.mockupCountdown}>
                  <div className={styles.mockupCountdownTitle}>FLASH SALE ENDING SOON</div>
                  <div className={styles.mockupTimerGrid}>
                    <div className={styles.mockupTimerBox}>
                      <div className={styles.mockupTimerNumber}>02</div>
                      <div className={styles.mockupTimerLabel}>Days</div>
                    </div>
                    <div className={styles.mockupTimerBox}>
                      <div className={styles.mockupTimerNumber}>14</div>
                      <div className={styles.mockupTimerLabel}>Hours</div>
                    </div>
                    <div className={styles.mockupTimerBox}>
                      <div className={styles.mockupTimerNumber}>32</div>
                      <div className={styles.mockupTimerLabel}>Minutes</div>
                    </div>
                    <div className={styles.mockupTimerBox}>
                      <div className={styles.mockupTimerNumber}>45</div>
                      <div className={styles.mockupTimerLabel}>Seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              </div>
              <h3 className={styles.featureTitle}>Easy Setup</h3>
              <p className={styles.featureDesc}>Install in seconds and start adding countdown timers to your store.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <h3 className={styles.featureTitle}>No Coding Required</h3>
              <p className={styles.featureDesc}>Create and customize timers without any coding skills.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
              <h3 className={styles.featureTitle}>Mobile Responsive</h3>
              <p className={styles.featureDesc}>Timers look perfect on all devices and screen sizes.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          © 2026 Countdown Timer
        </footer>
      </div>
    </div>
  );
}
