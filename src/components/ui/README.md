# UI Components Library

This folder contains reusable UI components adapted from the fenago21 boilerplate and styled with the PromptLingo brand design system.

## Components

### BrandedButton
Professional button component with multiple variants.

**Usage:**
```tsx
import { BrandedButton } from './components/ui';

<BrandedButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</BrandedButton>
```

**Variants:** primary, secondary, gradient, outline
**Sizes:** sm, md, lg

---

### BrandedCard
Container component for content sections.

**Usage:**
```tsx
import { BrandedCard } from './components/ui';

<BrandedCard title="Title" subtitle="Subtitle" variant="elevated">
  Content goes here
</BrandedCard>
```

**Variants:** default, gradient, elevated

---

### FeatureCard
Display features with icons and descriptions.

**Usage:**
```tsx
import { FeatureCard } from './components/ui';

<FeatureCard
  title="Feature Title"
  description="Feature description"
  highlight={true}
/>
```

---

### TestimonialCard
Display user testimonials with ratings.

**Usage:**
```tsx
import { TestimonialCard } from './components/ui';

<TestimonialCard
  name="User Name"
  role="User Role"
  quote="Testimonial text"
  rating={5}
/>
```

---

### Modal
Reusable modal dialog component.

**Usage:**
```tsx
import { Modal } from './components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  Modal content
</Modal>
```

**Sizes:** sm, md, lg, xl

---

### FAQ
Accordion-style FAQ component.

**Usage:**
```tsx
import { FAQ } from './components/ui';

const faqItems = [
  { question: "Question?", answer: "Answer." }
];

<FAQ items={faqItems} />
```

---

## Design System

All components use the PromptLingo brand design system:

- **Colors:** Brand colors (coral, peach, mint, skyBlue, indigo)
- **Typography:** Inter (sans) and DM Serif Display (serif)
- **Spacing:** Consistent spacing scale
- **Responsive:** Mobile-first design
- **Accessible:** Keyboard navigation, ARIA labels, focus indicators

## Import All Components

```tsx
import {
  BrandedButton,
  BrandedCard,
  FeatureCard,
  TestimonialCard,
  Modal,
  FAQ
} from './components/ui';
```

## Customization

All components accept a `className` prop for additional styling:

```tsx
<BrandedButton className="shadow-2xl transform hover:scale-105">
  Custom Styled
</BrandedButton>
```

## Source

Adapted from fenago21 Next.js boilerplate components with:
- React compatibility (no Next.js dependencies)
- PromptLingo brand design system
- TypeScript support
- Accessibility enhancements
