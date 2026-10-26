import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.plugins.credentials.impl.*
import jenkins.model.Jenkins

def domain = Domain.global()
def store = Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()

// Remove existing if any
def existing = store.getCredentials(domain).find { it.id == 'dockerhub-credentials' }
if (existing != null) {
    store.removeCredentials(domain, existing)
}

def credentials = new UsernamePasswordCredentialsImpl(
    CredentialsScope.GLOBAL,
    "dockerhub-credentials",
    "Docker Hub Credentials for akhand012",
    "akhand012",
    "dummy"
)
store.addCredentials(domain, credentials)
println(">>> Jenkins: dockerhub-credentials successfully configured! <<<")
