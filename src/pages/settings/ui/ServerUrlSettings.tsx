import { useAtom } from '@reatom/npm-react'
import { useState } from 'react'
import { OnboardingTarget } from 'features/onboarding'
import { serverUrlAtom } from 'shared/model'
import { CollapsibleGroup } from 'shared/ui/collapsible-group'
import { ServerUrlForm } from './ServerUrlForm'

export const ServerUrlSettings = ({ onboardingTargetId }: { onboardingTargetId?: string }) => {
  const [expanded, setExpanded] = useState(false)
  const [currentUrl] = useAtom(serverUrlAtom)

  return (
    <OnboardingTarget id={onboardingTargetId}>
      <CollapsibleGroup
        expanded={expanded}
        icon='link-outline'
        title='URL сервера API'
        subtitle={`Текущий: ${currentUrl}`}
        onToggle={() => setExpanded(prev => !prev)}
      >
        <ServerUrlForm />
      </CollapsibleGroup>
    </OnboardingTarget>
  )
}
