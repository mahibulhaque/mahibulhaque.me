import { useEffect, useMemo, useState } from "react";
import { searchDocuments } from "@/lib/search";
import type { SearchDocument } from "@/types/search";

interface IUseDocumentSearchProps{
  query: string;
  enabled: boolean;
}

export function useDocumentSearch({query, enabled }:IUseDocumentSearchProps) {
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || documents.length) return;

    setLoading(true);

    fetch("/search-index.json")
      .then((res) => res.json())
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, [enabled, documents]);

  const results = useMemo(
    () => searchDocuments(documents, query),
    [documents, query],
  );

  return { results, loading };
}
