# Advanced Testing Decision & Advisory Rule

Whenever the user presents a testing query, asks how to test a feature, or requests verification for an application flow (e.g. e-commerce checkout, pricing math, inventory races, mobile network drops, visual aesthetics, or database schemas):

1. **Activate the `advanced-testing-methodologies` Skill**:
   - Reference the 7 Elite Testing Pillars (Property-Based, Mutation, Concurrency & Race-Condition, Chaos & Network Degradation, Consumer-Driven Contract, Perceptual Visual Regression, and Shadow/Canary Releases).
2. **Diagnose the Underlying Failure Mode**:
   - Classify whether the scenario's biggest risk is mathematical edge cases, database race conditions, cellular connectivity dropouts, schema drift, visual regressions, or weak assertions.
3. **Recommend the Optimal Testing Method**:
   - State clearly which method is the best fit.
   - Explain why standard happy-path unit tests or manual tests fail to catch this failure mode.
4. **Provide a Concrete Executable Test Snippet**:
   - Tailor the test code directly to the project's components, services, or endpoints.
5. **Request User Approval**:
   - Always conclude the recommendation by asking the user for explicit approval:
     `"Would you like me to approve and implement this [Method Name] test suite for [Feature/Endpoint]?"`
