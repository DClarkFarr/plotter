# Research: Plot Row Color Sync

## Decision 1: Color softening algorithm

- **Decision**: Blend the plot color over white for light colors and over black for dark colors with a fixed alpha of 0.45.
- **Rationale**: Produces the requested 40-50% opacity effect and avoids new dependencies.
- **Alternatives considered**: Dynamic alpha based on luminance (rejected for added complexity and inconsistent visual results).

## Decision 2: Light vs dark classification

- **Decision**: Use relative luminance (sRGB) to classify colors as light when luminance $> 0.6$.
- **Rationale**: Aligns with perceived brightness and is simple to implement.
- **Alternatives considered**: HSL lightness threshold (rejected due to less accurate perceptual mapping).

## Decision 3: Text color selection

- **Decision**: Default to dark text, but switch to light text when contrast ratio against the softened background drops below 4.5:1.
- **Rationale**: Keeps the default preference while ensuring readable contrast.
- **Alternatives considered**: Fixed cutoff without contrast calculation (rejected for accessibility risk).
