**WARNING: THIS LIBRARY IS IN ALPHA -- A WORK IN PROGRESS -- USAGE AT YOUR OWN RISK**

Until version 1.0.0, the API is subject to breaking changes without a major version bump. This is not meant for production use by external users yet. Rather it is an internal project that is being developed in the open.

# Fine-grained authorization

Client package for Kilpi. Intended to be used with `@kilpi/server`. Provides client-side utils (fetching permissions, subject and more). Requires a server endpoint hosted via `@kilpi/server` `Kilpi.createPostEndpoint(...)` method to work, as all evaluation of subject and authorization rules is to be performed on the server and this package only fetches those permissions.
