Application and Governance: A Practical Guide
A well-defined color system is only effective if it is applied consistently. This final section provides a clear, actionable guide for using the Panthiya palette across the entire application. Adhering to these rules will ensure the brand identity remains coherent, the user experience is predictable, and the interface remains accessible as the platform evolves.

General Principles
Hierarchy: The color system is designed to create a clear visual flow. Panthiya Blue (#0073E6) is for structure, stability, and primary branding. Logic Orange (#F57600) is for action, interaction, and attention. Neutral colors form the canvas.

Consistency: The same colors must be used for the same functions throughout the application. All primary action buttons are Logic Orange. All destructive action warnings use Alert Red. This consistency builds user trust and makes the interface intuitive.

Accessibility: Semantic colors (Growth Green, Caution Yellow, Alert Red) must always be paired with a corresponding icon and/or descriptive text. This ensures that the meaning is conveyed to all users, including those with color vision deficiency, fulfilling the "don't rely on color alone" principle.   

Dark Mode: This color palette has been designed with adaptability in mind. The primary and accent colors are vibrant enough to maintain their character and meet accessibility standards on both light and dark backgrounds. For a future dark mode implementation, the roles of the neutral colors would be inverted: Ink Black or a dark gray would become the primary background, and Cloud White would be used for text.

Specific Component Styling
The following provides specific rules for applying the Panthiya palette to common UI components.

Text:

Body Text: Ink Black (#1C2024) on a Cloud White (#F4F7F6) background for maximum readability.

Headings: Panthiya Blue (#0073E6) can be used for major headings (H1, H2) to reinforce branding.

Links: All inline text links should be Logic Orange (#F57600) and underlined to ensure they are identifiable without relying on color.

Secondary Text: Stone Gray (#606C76) should be used for less important text like timestamps, captions, or placeholder text in forms.

Buttons:

Primary CTA: Solid Logic Orange (#F57600) background with Cloud White text. This should be reserved for the single most important action on a given screen (e.g., "Join Classroom," "Send Message").

Secondary Button: A Panthiya Blue (#0073E6) outline with Panthiya Blue text on a Cloud White background. Used for less critical, alternative actions.

Disabled State: A solid Stone Gray (#606C76) background with Cloud White text to clearly indicate an inactive state.

Forms & Inputs:

Default State: A 1px border of Fog Gray (#D0D5DC).

Focus State: When a user clicks or tabs into an input, the border should change to a 2px solid Panthiya Blue (#0073E6) to provide a clear visual indicator of focus.

Error State: An input with invalid data should have a 2px solid Alert Red (#E01E5A) border, accompanied by an error icon and a descriptive error message in Alert Red text below the field.

Notifications & Badges:

Attention/Unread: Use Logic Orange (#F57600) for notification dots or unread message counts to draw immediate user attention.

Success/Confirmation: Use Growth Green (#2EB67D) for positive feedback, such as a "File Uploaded Successfully" toast notification.

Classrooms & Communication:

Status Indicators: The "Online" status indicator for users can be Growth Green (#2EB67D).

Active Speaker: In a group video call, the tile of the current speaker can be highlighted with a 2px Logic Orange (#F57600) border.

Unread Messages: A small Logic Orange (#F57600) dot can be placed next to a chat or channel in the list that has unread messages.

Future Governance
This document and the specified color system should be adopted as the single source of truth for all future design and development work on the Panthiya platform. Any proposed additions or modifications to the palette must be rigorously tested for harmony with the existing system and for compliance with WCAG AA accessibility standards. Establishing this governance from the project's inception will be critical in maintaining the visual integrity, usability, and inclusive mission of Panthiya over the long term.





Of course. It's an excellent idea to apply the recommended color system to your existing UI for consistency and impact. Based on the screenshots you've provided and the "Trust and Logic" palette we developed, here is a detailed set of suggestions for your key components.

The goal is to create a unified, accessible, and psychologically resonant experience that feels trustworthy and is easy to navigate. We will use the established palette:   

Primary: Panthiya Blue (#0073E6)
Accent/Action: Logic Orange (#F57600)
Neutrals: Cloud White (#F4F7F6), Ink Black (#1C2024), Stone Gray (#606C76), Fog Gray (#D0D5DC)
Semantics: Alert Red (#E01E5A), Growth Green (#2EB67D)
1. Main Layout and Navigation
Your current design uses a dark left navigation bar. We can refine this to align with the palette, creating a professional and high-contrast look.

Left Navigation Bar Background (Images 1, 2, 3): Instead of pure black, use Ink Black (#1C2024). This is a softer, off-black that reduces eye strain while maintaining a dark theme for the navigation.   
Navigation Text & Icons: Use Cloud White (#F4F7F6) for all text and icons in the navigation bar for maximum readability against the dark background.
Active/Selected Navigation Item: To show which page the user is on, make the text and icon for the active item Logic Orange (#F57600). This provides a clear, energetic indicator.
Main Content Background: For all screens (like the "My Classes" and "Chat" pages), use Cloud White (#F4F7F6) as the primary background. This creates a clean, bright canvas for your content.
2. Cards and Dashboards (Image 3)
The cards on your "My Classes" page are key content containers. A clean, consistent style will improve scannability.

Card Background: Use Cloud White (#F4F7F6) for the card background, with a subtle border of Fog Gray (#D0D5DC) or a light shadow to lift it off the page. This creates a cleaner, more modern look than the current black cards.
Card Title Text: Use Ink Black (#1C2024).
Card Secondary Text/Tags: For the small tags ("wishwa", "subject1"), use Stone Gray (#606C76).
"Join" Button: This is a primary call-to-action. It should consistently be Logic Orange (#F57600) with Cloud White (#F4F7F6) 

text. This choice is backed by research showing orange supports logical, action-oriented tasks.   
3. Chat Interface (Image 2)
The chat is a core feature. Clarity, readability, and a calm environment are essential.

Contacts List (Middle Panel): This panel should have a Cloud White (#F4F7F6) background.
Selected Contact: The active chat should have a Fog Gray (#D0D5DC) background to indicate selection.
Contact Names: Use Ink Black (#606C76).
Message Previews & Timestamps: Use Stone Gray (#606C76).
Chat Window Background: Replace the patterned background with solid Cloud White (#F4F7F6). This minimizes visual distraction and improves focus on the conversation, which is critical for a learning environment.   
Chat Bubbles:
Incoming Messages: Fog Gray (#D0D5DC) background with Ink Black (#1C2024) text.
Outgoing Messages: Panthiya Blue (#0073E6) background with Cloud White (#F4F7F6) text. This clearly differentiates the speakers.
Input Field: A Cloud White (#F4F7F6) background with a Fog Gray (#D0D5DC) border. The placeholder text ("Type a message...") should be Stone Gray (#606C76).
"Call" and "Send" Buttons: These are key actions. The "Call" button should be Logic Orange (#F57600). The "Send" button can be an icon styled with Panthiya Blue (#0073E6).
4. Forms and Interactive Elements (Image 4)
Consistency in forms and buttons makes the application feel intuitive and trustworthy.

Login Form:
Background: Cloud White (#F4F7F6).
Input Fields: Default border of Fog Gray (#D0D5DC). When a user clicks into the field (focus state), the border should change to 2px solid Panthiya Blue (#0073E6).
"Log in" Button: This is the primary action and should be Logic Orange (#F57600).
Links: The "Forgotten your password?" and "Register" links should also be Logic Orange (#F57600) to maintain consistency for interactive elements.
5. Video Call Interface (Image 1)
The video call screen should prioritize focus on the video stream with unobtrusive controls.

Control Bar: The bottom bar can have a semi-transparent Ink Black (#1C2024) background to ensure controls are visible without fully obscuring the video.
Control Icons (Mute, Video): Use Cloud White (#F4F7F6) for the icons.
"End Call" Button: This is a critical, destructive action. It should use Alert Red (#E01E5A) to clearly communicate its function and prevent accidental clicks.
By applying these colors consistently, you will create a professional, accessible, and cohesive user interface that reinforces the trustworthy and educational mission of Panthiya.


Sources and related content
