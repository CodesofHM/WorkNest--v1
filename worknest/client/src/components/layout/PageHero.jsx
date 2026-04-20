import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Sparkles } from 'lucide-react';

const PageHero = ({
  themeClassName,
  badgeText,
  title,
  description,
  helperLabel,
  helperText,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
}) => {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-col gap-6 p-0 lg:flex-row lg:items-center lg:justify-between">
        <div className={`${themeClassName} px-5 py-6 text-white md:px-6 md:py-7 lg:flex-1`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
            <Sparkles className="h-3.5 w-3.5" />
            {badgeText}
          </div>
          <h1 className="max-w-2xl text-2xl font-semibold leading-tight md:text-3xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-[15px]">{description}</p>
        </div>
        <div className="flex flex-col gap-3 px-5 py-6 md:px-6 lg:w-[280px] lg:items-start">
          <p className="text-sm text-slate-500">{helperLabel}</p>
          <p className="text-sm text-slate-700">{helperText}</p>
          {actionLabel ? (
            <Button onClick={onAction} className="mt-2 w-full lg:w-auto">
              {ActionIcon ? <ActionIcon className="mr-2 h-4 w-4" /> : null}
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageHero;
