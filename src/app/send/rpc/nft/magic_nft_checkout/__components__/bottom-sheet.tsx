/* istanbul ignore file */
import { Animate, Button, IcoDismiss } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { PropsWithChildren, useCallback } from 'react';

export type BottomSheetProps = PropsWithChildren & {
  isOpened: boolean;
  setIsOpened: (opened: boolean) => void;
};

export const BottomSheet = ({ isOpened, setIsOpened, children }: BottomSheetProps) => {
  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, [setIsOpened]);

  return (
    <>
      <Animate type="slide" asChild show={isOpened}>
        <VStack
          role="button"
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.76)"
          zIndex={99997}
          borderRadius={24}
          mdDown={{
            borderRadius: 0,
          }}
          onClick={handleClose}
        />
        <Box
          key="bottom-sheet-content"
          pos="absolute"
          bottom={4}
          left={4}
          right={4}
          zIndex={99999}
          bg="surface.secondary"
          borderWidth="thin"
          borderStyle="solid"
          borderColor="rgba(255, 255, 255, 0.12)"
          borderRadius={6}
          boxShadow="0rem 1.5rem 3.5rem 0rem rgba(14, 14, 14, 0.55)"
          padding={6}
        >
          <Box pos="absolute" right={1} top={1}>
            <Button size="sm" variant="neutral" onPress={handleClose}>
              <Button.LeadingIcon>
                <IcoDismiss />
              </Button.LeadingIcon>
            </Button>
          </Box>
          {children}
        </Box>
      </Animate>
    </>
  );
};
