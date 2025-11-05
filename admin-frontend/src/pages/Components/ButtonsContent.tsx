import { Button } from '../../components/commons';
import { CheckIcon, DropdownIcon } from '../../components/commons/icons';

/**
 * Componente para mostrar el contenido de botones
 * @returns Componente ButtonsContent
 */
export const ButtonsContent = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Columna 1: Botones con fondo sólido oscuro */}
      <Button
        className="bg-[#004BB7] text-white"
        leftIcon={<CheckIcon color="white" />}
        rightIcon={<DropdownIcon color="white" />}
      >
        Label
      </Button>
      <Button
        className="bg-[#002254] text-white"
        leftIcon={<CheckIcon color="white" />}
        rightIcon={<DropdownIcon color="white" />}
      >
        Label
      </Button>
      <Button
        className="bg-[#0066FF] text-white"
        leftIcon={<CheckIcon color="white" />}
        rightIcon={<DropdownIcon color="white" />}
      >
        Label
      </Button>
      <Button
        className="bg-[#B0C9EE] text-white"
        leftIcon={<CheckIcon color="white" />}
        rightIcon={<DropdownIcon color="white" />}
      >
        Label
      </Button>

      {/* Columna 2: Botones con fondo sólido claro */}
      <Button
        className="bg-[#E6F0FF] text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<span className="text-[#004BB7]"><DropdownIcon color="#004BB7" /></span>}
      >
        Label
      </Button>
      <Button
        className="bg-[#B0C9EE] text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<span className="text-[#004BB7]"><DropdownIcon color="#004BB7" /></span>}
      >
        Label
      </Button>
      <Button
        className="bg-[#D1E0FF] text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<span className="text-[#004BB7]"><DropdownIcon color="#004BB7" /></span>}
      >
        Label
      </Button>
      <Button
        className="bg-[#F5F9FF] text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<span className="text-[#004BB7]"><DropdownIcon color="#004BB7" /></span>}
      >
        Label
      </Button>

      {/* Columna 3: Botones outlined */}
      <Button
        className="bg-white border-2 border-[#004BB7] text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<DropdownIcon color="#004BB7" />}
      >
        Label
      </Button>
      <Button
        className="bg-white border-2 border-[#004BB7] text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<DropdownIcon color="#004BB7" />}
      >
        Label
      </Button>
      <Button
        className="bg-white border-2 border-[#004BB7] text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<DropdownIcon color="#004BB7" />}
      >
        Label
      </Button>
      <Button
        className="bg-white border-2 border-[#B0C9EE] text-[#B0C9EE]"
        leftIcon={<CheckIcon color="#B0C9EE" />}
        rightIcon={<span className="text-[#B0C9EE]"><DropdownIcon color="#B0C9EE" /></span>}
      >
        Label
      </Button>

      {/* Columna 4: Botones solo texto */}
      <Button
        className="bg-transparent text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<DropdownIcon color="#004BB7" />}
      >
        Label
      </Button>
      <Button
        className="bg-transparent text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<DropdownIcon color="#004BB7" />}
      >
        Label
      </Button>
      <Button
        className="bg-transparent text-[#004BB7]"
        leftIcon={<CheckIcon color="#004BB7" />}
        rightIcon={<DropdownIcon color="#004BB7" />}
      >
        Label
      </Button>
      <Button
        className="bg-transparent text-[#B0C9EE]"
        leftIcon={<CheckIcon color="#B0C9EE" />}
        rightIcon={<span className="text-[#B0C9EE]"><DropdownIcon color="#B0C9EE" /></span>}
      >
        Label
      </Button>
    </div>
  );
};

