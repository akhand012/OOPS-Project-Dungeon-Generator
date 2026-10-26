import jenkins.model.*
import hudson.security.*
import jenkins.install.*

def instance = Jenkins.get()

// Set Jenkins Location URL
def jlc = JenkinsLocationConfiguration.get()
jlc.setUrl("http://3.108.51.253:8080/")
jlc.save()

// Configure security realm and create admin user
def realm = new HudsonPrivateSecurityRealm(false)
realm.createAccount("admin", "Admin123!@#")
instance.setSecurityRealm(realm)

def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

// Complete initial setup wizard
instance.setInstallState(InstallState.INITIAL_SETUP_COMPLETED)

instance.save()
println(">>> Jenkins Init Script: Admin user created and setup wizard completed <<<")
