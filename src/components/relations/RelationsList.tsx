"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { useCrmStore } from "@/lib/crm-store";

import { RelationRow } from "./RelationRow";

export function RelationsList() {
  const relations = useCrmStore((state) => state.data.relations);
  const openRelation = useCrmStore((state) => state.openRelation);

  return (
    <div className="space-y-3">
      {relations.length ? (
        relations.map((relation) => (
          <RelationRow key={relation.id} relation={relation} onOpen={() => openRelation(relation.id)} />
        ))
      ) : (
        <EmptyState title="Geen relaties" body="Voeg leveranciers of partners toe." />
      )}
    </div>
  );
}
