import { Skeleton, Stack, Card, CardContent } from '@mui/material';

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={52} animation="wave" />
      ))}
    </Stack>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ width: 280, flex: '1 1 280px', maxWidth: 360 }}>
          <Skeleton variant="rounded" height={160} animation="wave" />
          <CardContent>
            <Skeleton variant="text" width="60%" height={28} animation="wave" />
            <Skeleton variant="text" width="40%" animation="wave" />
            <Skeleton variant="text" width="80%" animation="wave" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export function FormSkeleton() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 600 }}>
      <Skeleton variant="rounded" height={56} animation="wave" />
      <Skeleton variant="rounded" height={56} animation="wave" />
      <Skeleton variant="rounded" height={56} animation="wave" />
      <Skeleton variant="rounded" height={120} animation="wave" />
      <Skeleton variant="rounded" height={48} width={160} animation="wave" />
    </Stack>
  );
}

export function DetailSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={240} animation="wave" />
      <Skeleton variant="text" width="50%" height={36} animation="wave" />
      <Skeleton variant="text" width="30%" animation="wave" />
      <Skeleton variant="rounded" height={180} animation="wave" />
    </Stack>
  );
}
