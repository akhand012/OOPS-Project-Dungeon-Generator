import jenkins.model.*
def instance = Jenkins.get()
def strategy = instance.getAuthorizationStrategy()
strategy.setAllowAnonymousRead(true)
instance.save()
println(">>> Anonymous read enabled successfully <<<")
