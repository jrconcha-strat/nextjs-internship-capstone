<!-- Based on: https://microsoft.github.io/code-with-engineering-playbook/code-reviews/pull-request-template/ -->
<!-- Be sure to replace the examples with your branch-appropriate content -->

## Description
<!-- Provide a brief summary of the purpose of this pull request. Bug/Feature Fix. It's impact, along with a summary of the solution -->
This pull request implements the authentication feature and associated layout protections.

<!--
## Steps to Reproduce Bug and Validate Solution

    Only applicable if the work is to address a bug. Please remove this section if the work is for a feature or story.
    Provide details on the environment the bug is found, and detailed steps to recreate the bug.
    This should be detailed enough for a team member to confirm that the bug no longer occurs. -->

## Summary of Changes
<!-- Summarize key changes, ideally grouped by task. Include relevant context and highlights. -->
1. **Task 2.4: Generate Authentication Forms**
   - Created Sign-In and Sign-Up UI components
   - Added form validation and error handling
   - Integrated Clerk authentication
   - Installed and configured the latest Clerk SDK

2. **Task 2.6: Create Protected Dashboard Layout**
   - Implemented protected layout wrapping for dashboard routes
   - Redirects unauthenticated users to the Sign-In page
   - Added sidebar toggle functionality for responsive views

## Dependencies
<!-- List new or updated dependencies introduced by this PR. -->
- Upgraded `next` from v14 to v15
- Updated Clerk SDK to the latest version

## Related Issues
<!-- Reference relevant tasks or issue IDs related to this pull request. -->
- Task 2.4: Generate Authentication Forms  
- Task 2.6: Create Protected Dashboard Layout

## PR Checklist
The following items help ensure this pull request is ready for review and merging:

- [ ] Added tests for new functionality
- [ ] All tests pass successfully
- [ ] Verified code runs locally without errors
- [ ] Linked all related issues and tasks
