import { useTransition, animated, easings } from '@react-spring/web';
import { Label } from '@/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/ui/RadioGroup';
import { Switch } from '@/ui/Switch';
import { KnowledgeGraphSettings } from '../Types';
import { Separator } from '@/ui/Separator';

interface SettingsPanelProps {

  open: boolean;

  settings: KnowledgeGraphSettings;

  onChangeSettings(changed: KnowledgeGraphSettings): void;

}

export const SettingsPanel = (props: SettingsPanelProps) => {

  const { settings } = props;  

  const transition = useTransition([props.open], {
    from: {  transform: 'translateY(50%)', opacity: 0 },
    enter: { transform: 'translateY(0%)', opacity: 1 },
    leave: { transform: 'translateY(50%)', opacity: 0 },
    config:{
      duration: 125,
      easing: easings.easeOutCubic
    }
  });

  return transition((style, open) => open && (
    <animated.div 
      className="bg-white/80 backdrop-blur-sm text-sm overflow-y-auto rounded 
        border pointer-events-auto shadow grow-0 shrink-0 basis-auto"
      style={style}>
      <fieldset className="p-3">
        <div className="pb-3">
          <legend>
            <div className="font-medium">Graph Display Mode</div> 
            <p className="text-muted-foreground text-xs mt-0.5">
              Select how graph nodes should be linked. 
            </p>
          </legend>
        </div>

        <RadioGroup 
          value={settings.graphMode} 
          onValueChange={(graphMode: 'HIERARCHY' | 'RELATIONS') => props.onChangeSettings({...settings, graphMode })}>
          <div className="flex items-start gap-3 pl-1">
            <RadioGroupItem 
              className="mt-[2px] flex-shrink-0"
              value="HIERARCHY" 
              id="HIERARCHY" />

            <div>
              <Label htmlFor="HIERARCHY">Hierarchy</Label>
              <p className="text-xs text-muted-foreground">
                Based on data model, folder hierarchy and entity annotations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pl-1">
            <RadioGroupItem 
              className="mt-[2px] flex-shrink-0"
              value="RELATIONS" 
              id="RELATIONS" />

            <div>
              <Label htmlFor="RELATIONS">Relations</Label>
              <p className="text-xs text-muted-foreground">
                Links are based on Relations. Hierarchy links are shown on hover.
              </p>
            </div>
          </div>
        </RadioGroup>
      </fieldset>

      <div className="px-3 py-1.5"><Separator /></div>

      <fieldset className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="hide-labels">
            Hide labels
          </Label>

          <Switch 
            checked={settings.hideLabels}
            id="hide-labels"
            onCheckedChange={checked => 
              props.onChangeSettings({...settings, hideLabels: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Don't show text labels for graph nodes. A hover tooltip
          will be used instead.
        </p>
      </fieldset>

      <fieldset className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="include-folders">
            Show sub-folders as nodes
          </Label>

          <Switch 
            checked={settings.includeFolders}
            id="include-folders"
            onCheckedChange={checked => 
              props.onChangeSettings({...settings, includeFolders: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Include sub-folders inside your workfolder as nodes in the graph.
        </p>
      </fieldset>

      <fieldset className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="hide-isolated">
            Hide unconnected nodes
          </Label>

          <Switch 
            id="hide-isolated" 
            checked={settings.hideIsolatedNodes}
            onCheckedChange={checked => 
              props.onChangeSettings({...settings, hideIsolatedNodes: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Remove unused entity classes and images without entity annotations from the graph.
        </p>
      </fieldset>
    </animated.div>
  ))

}